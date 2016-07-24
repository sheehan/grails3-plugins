package com.github.sheehan

class PluginController {

    def index() {
        Map json = [
            baseUrl: createLink(uri: '/')
        ]
        render view: 'index', model: [json: json]
    }

    def json() {
        response.setContentType("application/json")
        render this.class.getClassLoader().getResourceAsStream("plugins.json").text
    }
}
