import groovy.json.JsonOutput
@Grab('org.codehaus.groovy.modules.http-builder:http-builder:0.7')

import groovyx.net.http.RESTClient
import groovyx.net.http.HttpResponseDecorator
import static groovyx.net.http.ContentType.*

List getPackages() {

    String user = System.getProperty('BINTRAY_USER')
    String pass = System.getProperty('BINTRAY_PASS')

    int start = 0
    int total
    List packages = []

    while (true) {
        RESTClient client = new RESTClient('https://api.bintray.com/')
        if (start >= 100) {
            client.headers['Authorization'] = 'Basic ' + "$user:$pass".bytes.encodeBase64()
        }

        HttpResponseDecorator resp = client.get(
            path: 'repos/grails/plugins/packages',
            query: [start_pos: start]
        )

        total = resp.headers['X-RangeLimit-Total'].value.toInteger()
        start = resp.headers['X-RangeLimit-EndPos'].value.toInteger() + 1

        packages.addAll resp.data

        client.shutdown()

        if (start == total) break
    }
    packages
}

def getPackage(String pkg) {
    try {
        RESTClient client = new RESTClient('https://api.bintray.com/')

        HttpResponseDecorator resp = client.get(
            path: "packages/grails/plugins/$pkg"
        )
        resp.data
    } finally {
        client.shutdown()
    }
}

List packages = getPackages()
def data = packages.sort { it.name.toLowercase() }.collect { getPackage(it.name) }

def json = JsonOutput.toJson(data)
File f = new File('./data/plugins.json')
f.write JsonOutput.prettyPrint(json)