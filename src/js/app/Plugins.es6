grailsplugins.Plugins = class  {

    static fetch() {
        return $.get('build/dist/data/plugins.json').then(data => new grailsplugins.Plugins(data));
    }

    constructor(data) {
        this.labelsToIgnore = ['grails plugin', 'grails', 'plugin', 'plugins'];

        this._plugins = _.sortBy(data, pluginData => pluginData.name.toLowerCase());
        this._plugins.forEach(this._processPlugin, this);

        this._allLabels = _.chain(this._plugins)
            .pluck('labels')
            .flatten()
            .unique()
            .sortBy(it => it.toLowerCase())
            .value();
    }

    _processPlugin(pluginData) {
        if (pluginData.system_ids.length) {
            pluginData.dependency = pluginData.system_ids[pluginData.system_ids.length - 1] + ':' + pluginData.latest_version;
            pluginData.dependencyScope = this._parseAttr(pluginData, 'pluginScope', 'compile');
        }
        pluginData.labels = _.chain(pluginData.labels)
            .without(...this.labelsToIgnore)
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
    }

    _parseAttr(pluginData, name, defaultVal) {
        let attr = _.findWhere(pluginData.attributes, {name: name});
        return attr && attr.values && attr.values[0] ? attr.values[0] : defaultVal;
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
