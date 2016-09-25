grailsplugins.App = class {

    constructor(data) {
        this.baseUrl = data.baseUrl.slice(0, data.baseUrl.length - 1);

        this.setupRouter();

        $('.resources-dropdown-mobile-toggle').click(e => {
            e.preventDefault();
            e.stopPropagation();
            $('.resources-dropdown-toggle').click();
        });

        $('a.self-link').attr('href', this.baseUrl + '/');

        $('body').delegate('a[data-internal]', 'click', e => {
            e.preventDefault();
            let href = $(e.currentTarget).attr('href');
            page(href);
        });

        grailsplugins.Plugins.fetch(this.baseUrl).then(this.onPluginsFetch.bind(this));

        $('body').removeClass('hide');
    }

    setupRouter() {
        page.base(this.baseUrl);
        page('/q/:q', (context, next) => {
            // ga('send', 'pageview', canonicalPath);
            this.showSearch(context.params.q);
        });
        page('/plugin/:plugin', (context, next) => {
            // ga('send', 'pageview', canonicalPath);
            this.showPlugin(context.params.plugin);
        });
        page('*', (context, next) => {
            // ga('send', 'pageview', canonicalPath);
            this.showSearch('');
        });
    }

    onPluginsFetch(plugins) {
        this.plugins = plugins;
        this.searchView = new grailsplugins.views.SearchView($('.search-section'), this.plugins);
        this.pluginView = new grailsplugins.views.PluginView($('.plugin-section'));

        this.show();

        $('.socialize-button').click(e => {
            e.preventDefault();
            e.stopPropagation();
            $('.socialize-menu').animate({right: 0});
            $('body').one('click', () => {
                $('.socialize-menu').animate({right: -300});
            });
        });

        page.start();
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
