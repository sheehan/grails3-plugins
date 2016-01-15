window.App = {

    initialize() {
        Plugins.fetch().then(this.onLoadPluginData.bind(this));
        return this;
    },

    onHashChange(e) {
        e.preventDefault();
        e.stopPropagation();
        this.route();
    },

    route() {
        var hashId = window.location.hash;

        if (hashId && hashId.indexOf('#plugin/') === 0) {
            this.showPlugin(hashId.substring('#plugin/'.length));
        } else {
            this.showPluginList();
        }
    },

    onLoadPluginData(plugins) {
        window.addEventListener('hashchange', this.onHashChange.bind(this), false);

        this.plugins = plugins;

        $('.labels-section')
            .html(Handlebars.templates['labels']({labels: this.plugins.getLabels()}));

        $('.labels-section .searchby-label').click(e => {
            e.preventDefault();
            let value = $(e.currentTarget).find('span').text();
            if (/\s/.test(value)) {
                value = `"${value}"`;
            }
            this.updateSearchField(`label:${value}`);
        });

        $('.search-input').keyup(this.doSearch.bind(this));
        $('.clear-search').click(event => {
            event.preventDefault();
            this.updateSearchField('');
        });

        this.sort = 'name';
        $('.main-content').delegate('.search-select .dropdown-menu a', 'click', e => {
            e.preventDefault();
            this.sort = $(e.currentTarget).data('sort');
            this.doSearch();
        });

        $('.main-content').delegate('.searchby-owner', 'click', e => {
            e.preventDefault();
            let value = $(e.currentTarget).find('span').text();
            if (/\s/.test(value)) {
                value = `"${value}"`;
            }
            this.updateSearchField(`owner:${value}`);
        });

        this.doSearch();
        this.route();
    },

    updateSearchField(value) {
        this.showPluginList();
        $('.search-input').val(value);
        this.doSearch();
    },

    showPluginList() {
        $('.main-content').children().addClass('hide');
        $('.main-content').find('.list-page').removeClass('hide');
    },

    showPlugin(pluginName) {
        let plugin = this.plugins.findByName(pluginName);
        $('.main-content').children().addClass('hide');
        $('.main-content').find('.plugin-page')
            .removeClass('hide')
            .html(Handlebars.templates['plugin'](plugin));
        if (plugin.githubRepo) {
            $.ajax({
                url:     `https://api.github.com/repos/${plugin.githubRepo}/readme`,
                headers: {'Accept': 'application/vnd.github.VERSION.html'},
                type:    'GET'
            }).done(html => {
                $('.plugin-page .readme').html(html);
            }).fail(jqXhr => {
                if (jqXhr.status === 404) {
                    console.log('readme not available');
                    $('.plugin-page .readme').html('<span class="not-found">Readme not available.</span>');
                }
            });
        }

        if (plugin.dependency) {
            new Clipboard('.plugin-page .dependency-clip .clippy', {
                text: function (trigger) {
                    return $(trigger).closest('.input-group').find('input').val();
                }
            });
            // TODO clipboard.destroy();
            let $clippy = $('.plugin-page .dependency-clip .clippy');
            $clippy.tooltip({
                title:   'Copied!',
                trigger: 'manual'
            });

            $clippy.click(e => {
                e.preventDefault();
                $clippy.tooltip('show');
                _.delay(() => $clippy.tooltip('hide'), 2000);
            });
        }
    },

    doSearch() {
        let val = $('.search-input').val();
        $('.clear-search').toggleClass('hide', !val);

        let matches = this.plugins.search(val, this.sort);

        let searchCount;
        if (!val) {
            searchCount = `Showing all ${matches.length} plugins`;
        } else if (!matches.length) {
            searchCount = 'No matching plugins';
        } else {
            searchCount = `Showing ${matches.length} matching ${matches.length === 1 ? 'plugin' : 'plugins'}`;
        }

        $('.search-results').html(Handlebars.templates['plugins']({
            plugins: matches,
            searchCount: searchCount
        }));
        $(`.search-select .dropdown-menu a[data-sort="${this.sort}"]`).addClass('selected');
    }
}.initialize();
