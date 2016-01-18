@Grab('org.codehaus.groovy.modules.http-builder:http-builder:0.7')

import groovy.json.JsonOutput
import groovyx.net.http.RESTClient
import groovyx.net.http.HttpResponseDecorator
import static groovyx.net.http.ContentType.*

class Fetch {

    static String BINTRAY_USER = System.getenv('BINTRAY_USER')
    static String BINTRAY_PASS = System.getenv('BINTRAY_PASS')

    static void main(String[] args) {
        def newJson = fetchPluginsFromBintray()

        println "\nsaving to ${args[0]}"
        File f = new File(args[0])
        f.write JsonOutput.prettyPrint(JsonOutput.toJson(newJson))
    }

    static def fetchPluginsFromBintray() {
        List packages = getPackages()

        println '\nfetching packages...'
        packages.sort { it.name.toLowerCase() }.collect {
            println it.name
            getPackage(it.name)
        }
    }

    static List getPackages() {
        int start = 0
        int total
        List packages = []

        while (true) {
            RESTClient client = new RESTClient('https://api.bintray.com/')
            if (start >= 100) {
                client.headers['Authorization'] = 'Basic ' + "$BINTRAY_USER:$BINTRAY_PASS".bytes.encodeBase64()
            }

            println "fetching package list. start=$start"
            HttpResponseDecorator resp = client.get(
                path: 'repos/grails/plugins/packages',
                query: [start_pos: start]
            )

            total = 99 //resp.headers['X-RangeLimit-Total'].value.toInteger()
            start = resp.headers['X-RangeLimit-EndPos'].value.toInteger() + 1

            packages.addAll resp.data

            client.shutdown()

            if (start >= total) break
        }
        packages
    }

    static def getPackage(String pkg) {
        RESTClient client = new RESTClient('https://api.bintray.com/')

        HttpResponseDecorator resp = client.get(
            path: "packages/grails/plugins/$pkg"
        )
        client.shutdown()
        
        resp.data
    }
}