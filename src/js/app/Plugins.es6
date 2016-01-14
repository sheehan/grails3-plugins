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

            pluginData.labels.forEach(label => this.labels.add(label));

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

    search(val, sort = 'name') {
        let matches = this._plugins;

        if (val) {
            let labelMatch = val.match(/label:"?([^"]*)"?/);
            let ownerMatch = val.match(/owner:"?([^"]*)"?/);

            if (labelMatch) {
                matches = this._plugins.filter(pluginData => _.contains(pluginData.labels, labelMatch[1]));
            } else if (ownerMatch) {
                matches = this._plugins.filter(pluginData => pluginData.owner === ownerMatch[1]);
            } else {
                matches = this._plugins.filter(pluginData => pluginData.name.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            }
        }

        if (sort === 'name') {
            matches = _.sortBy(matches, it => it.name.toLowerCase());
        } else if (sort === 'date') {
            matches = _.sortBy(matches, it => it.updated ? new Date(it.updated) : undefined).reverse();
        }

        return matches;
    }

    findByName(name) {
        return _.findWhere(this._plugins, {name: name});
    }

    getLabels() {
        return (Array.from(this.labels)).sort();
    }
}
