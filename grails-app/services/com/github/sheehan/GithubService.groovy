package com.github.sheehan

import grails.config.Config
import grails.core.support.GrailsConfigurationAware
import groovyx.net.http.HttpResponseDecorator
import groovyx.net.http.RESTClient
import org.apache.http.client.HttpResponseException

import javax.annotation.PreDestroy

class GithubService implements GrailsConfigurationAware {

    private RESTClient githubClient

    Map fetchRepo(String ownerAndRepo) {
        Map data = null
        try {
            HttpResponseDecorator resp = githubClient.get(
                path: "repos/${ownerAndRepo}"
            )
            data = resp.data.subMap([
                'full_name',
                'html_url',
                'stargazers_count',
            ])
        } catch (HttpResponseException e) {
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
        data
    }

    @PreDestroy
    void destroy() {
        githubClient.shutdown()
    }

    @Override
    void setConfiguration(Config config) {
        String githubUsername = config.github.username
        String githubToken = config.github.token
        githubClient = new RESTClient('https://api.github.com/')
        githubClient.headers['Authorization'] = 'Basic ' + "$githubUsername:$githubToken".bytes.encodeBase64()
        githubClient.headers['User-Agent'] = 'Grails Plugins'
    }
}
