package com.github.sheehan

import grails.config.Config
import grails.core.support.GrailsConfigurationAware
import groovyx.net.http.HttpResponseDecorator
import groovyx.net.http.RESTClient

import javax.annotation.PreDestroy

class BintrayService implements GrailsConfigurationAware {

    private RESTClient bintrayClient

    List<Map> fetchPackages() {
        List packages = getPackageList()

        println '\nfetching packages...'
        packages.sort { it.name.toLowerCase() }.collect {
            println it.name
            getPackage(it.name)
        }
    }

    private List getPackageList() {
        int start = 0
        int total
        List packages = []

        while (true) {
            println "fetching package list. start=$start"
            HttpResponseDecorator resp = bintrayClient.get(
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

    private Map getPackage(String pkg) {
        HttpResponseDecorator packageResp = bintrayClient.get(path: "packages/grails/plugins/$pkg")

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
            'vcs_url',
            'versions',
            'website_url'
        ])

        data.attributes = bintrayClient.get(path: "packages/grails/plugins/$pkg/attributes").data

        if (data.latest_version) {
            def versionData = bintrayClient.get(path: "packages/grails/plugins/$pkg/versions/${data.latest_version}").data
            data.latest_version_created = versionData.created
            data.latest_version_updated = versionData.updated
        }

        data
    }

    @PreDestroy
    void destroy() {
        bintrayClient.shutdown()
    }

    @Override
    void setConfiguration(Config config) {
        String bintrayUsername = config.bintray.username
        String bintrayToken = config.bintray.token
        bintrayClient = new RESTClient('https://api.bintray.com/')
        bintrayClient.headers['Authorization'] = 'Basic ' + "$bintrayUsername:$bintrayToken".bytes.encodeBase64()
    }
}
