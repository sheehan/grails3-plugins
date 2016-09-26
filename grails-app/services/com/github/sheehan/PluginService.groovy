package com.github.sheehan

class PluginService {

    GithubService githubService
    BintrayService bintrayService

    Compare refreshPlugins() {
        List<Map> plugins = bintrayService.fetchPackages().collect { Map data ->
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

            data
        }

        Compare compare = Plugins.get() ? new Compare(Plugins.get(), plugins) : null
        Plugins.set plugins

        compare
    }
}
