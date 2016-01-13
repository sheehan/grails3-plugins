class Plugins {

    static fetch() {
        return $.get('data/plugins.json').then(data => new Plugins(data));
    }

    constructor(data) {
        this._plugins = _.sortBy(data, pluginData => pluginData.name.toLowerCase());

        this.labels = new Set();

        this._plugins.forEach(pluginData => {
            if (pluginData.system_ids.length) {
                pluginData.dependency = pluginData.system_ids[0] + ':' + pluginData.latest_version;
            }
            pluginData.labels.sort();

            pluginData.labels.forEach(label => {
                this.labels.add(label);
            });

            pluginData.bintrayHref = `https://bintray.com/${pluginData.owner}/${pluginData.repo}/${pluginData.name}`;
            if (pluginData.vcs_url.indexOf('github') !== -1) {
                pluginData.githubHref = pluginData.vcs_url;

                let matchResult = pluginData.vcs_url.match(/.*github\.com\/([^\/]+\/[^\/]+)/);
                if (matchResult) {
                    pluginData.githubRepo = matchResult[1];
                }
            }
        });

        // TODO: Remove invalid labels, need to find better way to exclude invalid labels
        // labels.delete("grails plugin");
        // labels.delete("grails");
        // labels.delete("plugin");
        // labels.delete("plugins");
    }

    search(val) {
        let matches = this._plugins;
        if (val) {
            matches = this._plugins.filter(pluginData => {
                let labelMatch = val.match(/label:"?([^"]*)"?/);
                if (labelMatch) {
                    return _.contains(pluginData.labels, labelMatch[1]);
                }

                let ownerMatch = val.match(/owner:"?([^"]*)"?/);
                if (ownerMatch) {
                    return pluginData.owner == ownerMatch[1];
                }

                return pluginData.name.toLowerCase().indexOf(val.toLowerCase()) !== -1 ||
                    pluginData.labels.some(label => label.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            });
        }
        return matches;
    }

    findByName(name) {
        return _.find(this._plugins, plugin => plugin.name === name);
    }

    getLabels() {
        return (Array.from(this.labels)).sort();
    }
}
