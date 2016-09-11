package com.github.sheehan

class PluginService {

    GithubService githubService
    BintrayService bintrayService

    List<Map> plugins

    Compare refreshPlugins() {
        List<Map> plugins = bintrayService.fetchPackages()
        plugins.each { Map data ->
            if (data.vcs_url) {
                def matcher = data.vcs_url =~ /.*github\.com\/([^\/]+\/[^\/\.]+).*/
                if (matcher.matches()) {
                    String ownerAndRepo = matcher[0][1]
                    Map githubData = githubService.fetchRepo(ownerAndRepo)
                    if (githubData) {
                        data.githubRepo = githubData
                    }
                }
            }
        }

        Compare compare = this.plugins ? new Compare(this.plugins, plugins) : null
        this.plugins = plugins

        compare
    }
}
