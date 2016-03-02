grailsplugins.App = class {

    constructor() {
        this.isEmbedded = window.self !== window.top;
        $('.navbar, .github-fork-ribbon').toggleClass('hide', this.isEmbedded);
        $('body').removeClass('hide');

        grailsplugins.Plugins.fetch().then(this.onPluginsFetch.bind(this));

        $('.resources-dropdown-mobile-toggle').click(e => {
            e.preventDefault();
            e.stopPropagation();
            $('.resources-dropdown-toggle').click();
        });
    }

    onHashChange(e) {
        e.preventDefault();
        e.stopPropagation();
        this.route();
    }

    route() {
        //let hashId = this.isEmbedded ? window.parent.location.hash : window.location.hash;
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
        //if (this.isEmbedded) {
        //    window.addEventListener('hashchange', () => {
        //        window.parent.location.hash = window.location.hash;
        //    }, false);
        //    window.parent.addEventListener('hashchange', e => {
        //        if (window.location.hash !== window.parent.location.hash) { // forward/back nav
        //            history.replaceState(undefined, undefined, window.parent.location.hash ? window.parent.location.hash : '#');
        //        }
        //        this.onHashChange(e);
        //    }, false);
        //} else {
            window.addEventListener('hashchange', this.onHashChange.bind(this), false);
        //}
    }

    onPluginsFetch(plugins) {
        this.addHashChangeListener();

        this.plugins = plugins;
        this.searchView = new grailsplugins.views.SearchView($('.search-page'), this.plugins);
        this.pluginView = new grailsplugins.views.PluginView($('.plugin-page'));

        $('.page-loading').remove();
        $('.main-content').removeClass('hide');
        this.route();
    }

    showSearch(q = '') {
        document.title = 'Grails 3 Plugins';
        this.searchView.$el.removeClass('hide');
        this.pluginView.$el.addClass('hide');
        this.searchView.search(q);
    }

    showPlugin(pluginName) {
        document.title = pluginName;
        this.searchView.$el.addClass('hide');
        this.pluginView.$el.removeClass('hide');
        let plugin = this.plugins.findByName(pluginName);
        this.pluginView.showPlugin(plugin);
    }
};
