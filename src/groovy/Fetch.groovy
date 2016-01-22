@Grab('org.codehaus.groovy.modules.http-builder:http-builder:0.7')

import groovy.json.JsonOutput
import groovyx.net.http.RESTClient
import groovyx.net.http.HttpResponseDecorator
import static groovyx.net.http.ContentType.*

class Fetch {

    static String BINTRAY_USER = System.getenv('BINTRAY_USER')
    static String BINTRAY_PASS = System.getenv('BINTRAY_PASS')

    final RESTClient anonymousClient
    final RESTClient authenticatedClient

    static void main(String[] args) {
        Fetch fetch = new Fetch()
        try {
            fetch.fetch(new File(args[0]))
        } finally {
            fetch.close()
        }
    }

    Fetch() {
        anonymousClient = new RESTClient('https://api.bintray.com/')
        authenticatedClient = new RESTClient('https://api.bintray.com/')
        authenticatedClient.headers['Authorization'] = 'Basic ' + "$BINTRAY_USER:$BINTRAY_PASS".bytes.encodeBase64()
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
            RESTClient client = start >= 100 ? authenticatedClient : anonymousClient

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
        Map data = anonymousClient.get(path: "packages/grails/plugins/$pkg").data
        data.attributes = anonymousClient.get(path: "packages/grails/plugins/$pkg/attributes").data

        data
    }

    void close() {
        anonymousClient.shutdown()
        authenticatedClient.shutdown()
    }
}