grailsplugins.Plugins = class {

    static fetch(baseUrl) {
        return $.get(`${baseUrl}/plugin/json`).then(data => new grailsplugins.Plugins(data));
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

        pluginData.licenses = pluginData.licenses.map(license => {
            return {
                name: license,
                url: 'https://opensource.org/licenses/' + license.replace(/\s/g, '-')
            };
        });

        pluginData.bintrayHref = `https://bintray.com/${pluginData.owner}/${pluginData.repo}/${pluginData.name}`;
        pluginData.bintrayRepo = `${pluginData.owner}/${pluginData.repo}/${pluginData.name}`;

        if (/(grails\.org)|(github\.com)|(grails-plugins\.org)/.test(pluginData.website_url)) {
            pluginData.website_url = undefined; // ignore these
        }
    }

    _parseAttr(pluginData, name, defaultVal) {
        let attr = _.findWhere(pluginData.attributes, {name: name});
        return attr && attr.values && attr.values[0] ? attr.values[0] : defaultVal;
    }

    search(query) {
        let matches = this._plugins;

        _.each(query.getParams(), (value, field) => {
            if (field === 'q') {
                matches = matches.filter(pluginData => pluginData.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
            } else if (field === 'label') {
                matches = matches.filter(pluginData => _.contains(pluginData.labels, value));
            } else if (field === 'owner') {
                matches = matches.filter(pluginData => pluginData.owner === value);
            }
        });

        let sort = query.getSort() || 'name';
        if (sort === 'name') {
            matches = _.sortBy(matches, it => it.name.toLowerCase());
        } else if (sort === 'date') {
            matches = _.sortBy(matches, it => it.latest_version_updated ? new Date(it.latest_version_updated).getTime() : 0).reverse();
        } else if (sort === 'stars') {
            matches = _.sortBy(matches, it => it.githubRepo ? it.githubRepo.stargazers_count : 0).reverse();
        }

        return matches;
    }

    findByName(name) {
        return _.findWhere(this._plugins, {name: name});
    }

    getLabels() {
        return this._allLabels;
    }

    getLabelCounts() {
        return _.chain(this._plugins)
            .pluck('labels')
            .flatten()
            .countBy()
            .map((v, k) => ({name: k, count: v}))
            .sortBy('name')
            .sortBy(it => it.count * -1)
            .value();
    }

    getOwnerCounts() {
        return _.chain(this._plugins)
            .pluck('owner')
            .flatten()
            .countBy()
            .map((v, k) => ({name: k, count: v}))
            .sortBy('name')
            .sortBy(it => it.count * -1)
            .value();
    }
};
