package com.github.sheehan

class Compare {

    final List<NewVersion> newVersions = []

    Compare(List<Map> oldJson, List<Map> newJson) {
        newJson.each { plugin ->
            Map match = oldJson.find { it.name == plugin.name }
            if (!match) {
                if (plugin.latest_version) {
                    newVersions << new NewVersion(version: plugin.latest_version, plugin: plugin)
                }
                return
            }

            if (plugin.latest_version_created != match.latest_version_created) {
                List versions = plugin.versions - match.versions
                if (versions) {
                    versions.reverse().each { String version ->
                        newVersions << new NewVersion(version: version, plugin: plugin)
                    }
                }
            }
        }
    }

    static class NewVersion {
        Map plugin
        String version
    }
}
