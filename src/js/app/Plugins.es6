grailsplugins.Plugins = class  {

    static fetch() {
        return $.get('build/dist/data/plugins.json').then(data => new grailsplugins.Plugins(data));
    }

    constructor(data) {
        this._plugins = _.sortBy(data, pluginData => pluginData.name.toLowerCase());

        let labelsToIgnore = ['grails plugin', 'grails', 'plugin', 'plugins'];

        this._plugins.forEach(pluginData => {
            if (pluginData.system_ids.length) {
                pluginData.dependency = pluginData.system_ids[0] + ':' + pluginData.latest_version;
            }
            pluginData.labels = _.chain(pluginData.labels)
                .without(...labelsToIgnore)
                .sortBy(it => it.toLowerCase())
                .value();

            pluginData.bintrayHref = `https://bintray.com/${pluginData.owner}/${pluginData.repo}/${pluginData.name}`;
            if (pluginData.vcs_url.indexOf('github') !== -1) {
                pluginData.githubHref = pluginData.vcs_url;

                let matchResult = pluginData.vcs_url.match(/.*github\.com\/([^\/]+\/[^\/]+)/);
                if (matchResult) {
                    pluginData.githubRepo = matchResult[1];
                }
            }
        });

        this._allLabels = _.chain(this._plugins)
            .pluck('labels')
            .flatten()
            .unique()
            .sortBy(it => it.toLowerCase())
            .value();
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
        return this._allLabels;
    }
};
