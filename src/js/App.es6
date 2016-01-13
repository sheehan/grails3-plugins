Handlebars.registerHelper('fromNow', string => string ? moment(string).fromNow() : '');

/*
* Grab metadata from repo attributes to create build.gradle syntax.
* Example metadata:
* "attribute_names": [
*  {"name": "pluginScope", "values" : ["compile"], "type": "string"}
* ]
*/
Handlebars.registerHelper('gradleFormat', function(plugin){
    var pluginScope = "";
    // TODO: implement these
    var buildScript = "";
    var applyPlugin = "";
    var sourceSets = "";

    plugin.attribute_names.forEach(function (attributes) {
        if(attributes.name == "pluginScope") {
            pluginScope += "\ndependancies {\n"
            pluginScope += "    " + attributes.values + " '" + plugin.dependency + "'\n"
            pluginScope += "}\n"
        }
    });

    if(pluginScope == "") {
        pluginScope += "\ndependancies {\n"
        pluginScope += "    compile '" + plugin.dependency + "'\n"
        pluginScope += "}\n"
    }

    return buildScript + applyPlugin + pluginScope + sourceSets;
});

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

        if (hashId) {
            this.showPlugin(hashId.substring(1));
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
            $('.search-input').val(`label:${value}`);
            this.doSearch();
        });

        $('.search-input').keyup(this.doSearch.bind(this));
        $('.clear-search').click(event => {
            event.preventDefault();
            $('.search-input').val('');
            this.doSearch();
        });

        this.doSearch();
        this.route();
    },

    showPluginList() {
        $('.main-content').children().addClass('hide');
        $('.main-content').find('.list-page').removeClass('hide');

        this.searchbyOwnerClickHandler();
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
                    // TODO display on page
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
        this.searchbyOwnerClickHandler();
    },

    doSearch() {
        let val = $('.search-input').val();
        $('.clear-search').toggleClass('hide', !val);

        let matches = this.plugins.search(val);

        $('.search-results')
            .html('')
            .append(Handlebars.templates['plugins']({plugins: matches}))

        this.searchbyOwnerClickHandler();
    },

    searchbyOwnerClickHandler() {
        $('.searchby-owner').click(e => {
            e.preventDefault();
            let value = $(e.currentTarget).find('span').text();
            if (/\s/.test(value)) {
                value = `"${value}"`;
            }
            $('.main-content').children().addClass('hide');
            $('.main-content').find('.list-page').removeClass('hide');
            $('.search-input').val(`owner:${value}`);
            this.doSearch();
        });
    }
}.initialize();
