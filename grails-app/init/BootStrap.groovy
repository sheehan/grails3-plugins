import com.github.sheehan.PluginService
import grails.util.Environment
import groovy.json.JsonSlurper

class BootStrap {

    PluginService pluginService

    def init = { servletContext ->
        if (Environment.developmentMode) {
            pluginService.plugins = new JsonSlurper().parseText(this.class.getClassLoader().getResourceAsStream('plugins.json').text)
        } else {
            pluginService.refreshPlugins()
        }
    }

    def destroy = {
    }
}
