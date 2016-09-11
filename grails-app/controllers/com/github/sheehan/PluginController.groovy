package com.github.sheehan

import grails.converters.JSON
import groovy.json.JsonSlurper

import java.text.DateFormat
import java.text.SimpleDateFormat

class PluginController {

    PluginService pluginService

    def index() {
        Map json = [
            baseUrl: createLink(uri: '/')
        ]
        render view: 'index', model: [json: json]
    }

    def plugin() {
        def pluginsJson = new JsonSlurper().parseText(this.class.getClassLoader().getResourceAsStream("plugins.json").text)
        Map plugin = pluginsJson.find { it.name == params.plugin }

        Map json = [
            baseUrl: createLink(uri: '/')
        ]

        Map model = [
            json  : json,
            plugin: plugin,
            domain: request.getServerName().replaceAll(".*\\.(?=.*\\.)", ""),
        ]

        if (plugin.latest_version_updated) {
            DateFormat utc = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            DateFormat display = new SimpleDateFormat('MMM d, yyyy')
            Date date = utc.parse(plugin.latest_version_updated)
            model.lastUpdated = display.format(date)
        }

        if (plugin.githubRepo) {
            model.stars = plugin.githubRepo.stargazers_count
        }

        render view: 'index', model: model
    }

    def json() {
        render pluginService.plugins as JSON
    }
}
