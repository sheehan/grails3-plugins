(function($) {

    Handlebars.registerHelper('fromNow', string => string ? moment(string).fromNow(): '');

    Handlebars.registerHelper('gradleFormat', function(plugin){
        console.log(plugin.attribute_names);
        var buildScript = "";
        var applyPlugin = "";
        var pluginScope = "";
        var sourceSets = "";

        plugin.attribute_names.forEach(function (attributes) {
            if(attributes.name == "buildScript") {
                buildScript = "buildScript {\n";
                buildScript += "    dependencies {\n"
                buildScript += "        " + attributes.values + "\n";
                buildScript += "    }\n"
                buildScript += "}\n"
            }
            if(attributes.name == "applyPlugin") {
                applyPlugin += "\napply '" + attributes.values + "'\n";
            }

            if(attributes.name == "pluginScope") {
                pluginScope += "\ndependancies {\n"
                pluginScope += "    " + attributes.values + " '" + plugin.dependency + "'\n"
                pluginScope += "}\n"
            }
            if(attributes.name == "sourceSets") {
                sourceSets += "\nsourceSets {\n"
                sourceSets += "    main {\n"
                sourceSets += "        resources {\n"
                sourceSets += "            srcDir '" + attributes.values + "'\n"
                sourceSets += "        }\n"
                sourceSets += "    }\n"
                sourceSets += "}\n"
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
            $.get('data/plugins.json').then(this.onLoadPluginData.bind(this));
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
                hashId = hashId.substring(1);
                this.showPlugin(hashId);
            } else {
                this.showPluginList();
            }
        },

        onLoadPluginData(data) {
            window.addEventListener('hashchange', this.onHashChange.bind(this), false);

            data = _.sortBy(data, pluginData => pluginData.name.toLowerCase());
            this.plugins = data;
            this.plugins.forEach(pluginData => {
                if (pluginData.system_ids.length) {
                    pluginData.dependency = pluginData.system_ids[0] + ':' + pluginData.latest_version;
                }
                pluginData.labels.sort();
                pluginData.bintrayHref = `https://bintray.com/${pluginData.owner}/${pluginData.repo}/${pluginData.name}`;
                if (pluginData.vcs_url.indexOf('github') !== -1) {
                    pluginData.githubHref = pluginData.vcs_url;

                    let matchResult = pluginData.vcs_url.match(/.*github\.com\/([^\/]+\/[^\/]+)/);
                    if (matchResult) {
                        pluginData.githubRepo = matchResult[1];
                    }
                }
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
        },

        showPlugin(pluginName) {
            let plugin = _.find(this.plugins, plugin => plugin.name === pluginName);
            $('.main-content').children().addClass('hide');
            $('.main-content').find('.plugin-page')
                .removeClass('hide')
                .html(Handlebars.templates['plugin'](plugin));
            if (plugin.githubRepo) {
                $.ajax({
                    url: `https://api.github.com/repos/${plugin.githubRepo}/readme`,
                    headers: {'Accept': 'application/vnd.github.VERSION.html'},
                    type: 'GET'
                }).done(html => {
                    $('.plugin-page .readme').html(html);
                }).fail(jqXhr => {
                    if (jqXhr.status === 404) {
                        console.log('readme not available');
                    }
                });
            }

            if (plugin.dependency) {
                new Clipboard('.plugin-page .dependency-clip .clippy', {
                    text: function(trigger) {
                        return $(trigger).closest('.input-group').find('input').val();
                    }
                });
                // clipboard.destroy();
                let $clippy = $('.plugin-page .dependency-clip .clippy');
                $clippy.tooltip({
                    title: 'Copied!',
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

            let matches = this.plugins;
            if (val) {
                matches = this.plugins.filter(pluginData => {
                    return pluginData.name.toLowerCase().indexOf(val.toLowerCase()) !== -1 ||
                        pluginData.labels.some(label => label.toLowerCase().indexOf(val.toLowerCase()) !== -1);
                });
            }

            $('.search-results')
                .html('')
                .append(Handlebars.templates['plugins']({plugins: matches}))
        }
    }.initialize();

})(jQuery);