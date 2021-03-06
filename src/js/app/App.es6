grailsplugins.App = class {

    constructor() {
        this.isEmbedded = window.self !== window.top;
        this.baseUrl = 'https://grails.org/plugins.html';

        $('.resources-dropdown-mobile-toggle').click(e => {
            e.preventDefault();
            e.stopPropagation();
            $('.resources-dropdown-toggle').click();
        });

        $('a.self-link').attr('href', this.baseUrl + '#');

        $('body').delegate('a[data-internal]', 'click', e => {
            e.preventDefault();
            let href = $(e.currentTarget).attr('href');
            window.location.hash = href.substr(this.baseUrl.length);
        });

        grailsplugins.Plugins.fetch().then(this.onPluginsFetch.bind(this));

        $('body').removeClass('hide');
    }

    route() {
        let hashId = window.location.hash;

        if (hashId && hashId.indexOf('#plugin/') === 0) {
            this.showPlugin(hashId.substring('#plugin/'.length));
        } else {
            let q = hashId && hashId.indexOf('#q/') === 0 ? hashId.substring('#q/'.length) : '';
            this.showSearch(q);
        }
        ga('send', 'pageview', hashId);
    }

    addHashChangeListener() {
        if (this.isEmbedded) {
            window.addEventListener('hashchange', () => {
                let hash = window.location.hash ? window.location.hash : '#';
                window.parent.postMessage({
                    type: 'hashchange',
                    hash: hash
                }, '*');
            }, false);
            window.addEventListener('message', e => {
                let hash = e.data.hash;
                if (e.data.type === 'init') {
                    window.location.hash = hash;
                    this.show();
                } else {
                    if (window.location.hash !== hash) { // forward/back nav
                        history.replaceState(undefined, undefined, hash ? hash : '#');
                    }
                }
                this.route();
            }, false);
        } else {
            window.addEventListener('hashchange', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.route();
            }, false);
        }
    }

    onPluginsFetch(plugins) {
        this.addHashChangeListener();

        this.plugins = plugins;
        this.searchView = new grailsplugins.views.SearchView($('.search-section'), this.plugins);
        this.pluginView = new grailsplugins.views.PluginView($('.plugin-section'));

        if (!this.isEmbedded) {
            this.show();
            this.route();
        }
    }

    show() {
        $('.page-loading').remove();
        $('.main-content').removeClass('hide');
    }

    showSearch(q = '') {
        document.title = 'Grails 3 Plugins';
        $('.search-section').removeClass('hide');
        $('.plugin-section').addClass('hide');

        let scrollTop = 0;
        if (this._lastSearchScrollTop) {
            scrollTop = this._lastSearchScrollTop;
            this._lastSearchScrollTop = undefined;
        }
        $('body').scrollTop(scrollTop);

        if (this._lastSearch !== q) {
            this._lastSearch = q;
            this.searchView.search(q);
        }
    }

    showPlugin(pluginName) {
        this._lastSearchScrollTop = $('body').scrollTop();

        document.title = pluginName;
        $('.search-section').addClass('hide');
        $('.plugin-section').removeClass('hide');
        let plugin = this.plugins.findByName(pluginName);
        this.pluginView.showPlugin(plugin);
    }
};
