@Grab('org.codehaus.groovy.modules.http-builder:http-builder:0.7')

import groovy.json.JsonOutput
import groovyx.net.http.RESTClient
import groovyx.net.http.HttpResponseDecorator
import static groovyx.net.http.ContentType.*

class Fetch {

    static String BINTRAY_USER = System.getenv('BINTRAY_USER')
    static String BINTRAY_PASS = System.getenv('BINTRAY_PASS')
    static String GITHUB_USER = System.getenv('GITHUB_USER')
    static String GITHUB_PASS = System.getenv('GITHUB_PASS')

    final RESTClient anonymousBintrayClient
    final RESTClient authenticatedBintrayClient
    final RESTClient authenticatedGithubClient

    static void main(String[] args) {
        Fetch fetch = new Fetch()
        try {
            fetch.fetch(new File(args[0]))
        } finally {
            fetch.close()
        }
    }

    Fetch() {
        anonymousBintrayClient = new RESTClient('https://api.bintray.com/')

        authenticatedBintrayClient = new RESTClient('https://api.bintray.com/')
        authenticatedBintrayClient.headers['Authorization'] = 'Basic ' + "$BINTRAY_USER:$BINTRAY_PASS".bytes.encodeBase64()

        authenticatedGithubClient = new RESTClient('https://api.github.com/')
        authenticatedGithubClient.headers['Authorization'] = 'Basic ' + "$GITHUB_USER:$GITHUB_PASS".bytes.encodeBase64()
        authenticatedGithubClient.headers['User-Agent'] = 'Grails Plugins'
    }

    void fetch(File outputFile) {
        def newJson = fetchPluginsFromBintray()
        println "\nsaving to $outputFile.name"
        outputFile.write JsonOutput.prettyPrint(JsonOutput.toJson(newJson))
    }

    List fetchPluginsFromBintray() {
        List packages = getPackageList()

        println '\nfetching packages...'
        packages.sort { it.name.toLowerCase() }.collect {
            println it.name
            getPackage(it.name)
        }
    }

    List getPackageList() {
        int start = 0
        int total
        List packages = []

        while (true) {
            RESTClient client = start >= 100 ? authenticatedBintrayClient : anonymousBintrayClient

            println "fetching package list. start=$start"
            HttpResponseDecorator resp = client.get(
                path: 'repos/grails/plugins/packages',
                query: [start_pos: start]
            )

            total = resp.headers['X-RangeLimit-Total'].value.toInteger()
            start = resp.headers['X-RangeLimit-EndPos'].value.toInteger() + 1

            packages.addAll resp.data

            if (start == total) break
        }
        packages
    }

    Map getPackage(String pkg) {
        HttpResponseDecorator packageResp = anonymousBintrayClient.get(path: "packages/grails/plugins/$pkg")

        Map data = packageResp.data.subMap([
            'desc',
            'issue_tracker_url',
            'labels',
            'latest_version',
            'licenses',
            'name',
            'owner',
            'repo',
            'system_ids',
            'updated',
            'vcs_url',
            'versions',
            'website_url'
        ])

        data.attributes = anonymousBintrayClient.get(path: "packages/grails/plugins/$pkg/attributes").data

        if (data.vcs_url) {
            def matcher = data.vcs_url =~ /.*github\.com\/([^\/]+\/[^\/\.]+).*/
            if (matcher.matches()) {
                String ownerAndRepo = matcher[0][1]
                try {
                    HttpResponseDecorator resp = authenticatedGithubClient.get(
                        path: "repos/${ownerAndRepo}"
                    )
                    data.githubRepo = resp.data.subMap([
                        'full_name',
                        'html_url',
                        'forks_count',
                        'stargazers_count',
                        'watchers_count',
                        'has_issues',
                    ])
                } catch(org.apache.http.client.HttpResponseException e) {
                    if (e.statusCode == 404) {
                        println "github repo not found: $ownerAndRepo"
                    } else {
                        println "failed to fetch github repo: $ownerAndRepo"
                        e.printStackTrace()
                    }
                } catch (e) {
                    println "failed to fetch github repo: $ownerAndRepo"
                    e.printStackTrace()
                }
            }
        }

        if (data.latest_version) {
            def versionData = authenticatedBintrayClient.get(path: "packages/grails/plugins/$pkg/versions/${data.latest_version}").data
            data.latest_version_created = versionData.created
        }

        data
    }

    void close() {
        anonymousBintrayClient.shutdown()
        authenticatedBintrayClient.shutdown()
        authenticatedGithubClient.shutdown()
    }
}