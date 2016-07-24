package com.github.sheehan

class UrlMappings {

    static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }

        "/"(controller: 'plugin', action: 'index')
        "/plugin/json"(controller: 'plugin', action: 'json')
        "/plugin/$plugin"(controller: 'plugin', action: 'index')
        "/q/$query"(controller: 'plugin', action: 'index')

        "500"(view:'/error')
        "404"(view:'/notFound')
    }
}
