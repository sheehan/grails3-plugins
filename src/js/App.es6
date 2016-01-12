(function($) {

    Handlebars.registerHelper('fromNow', string => string ? moment(string).fromNow(): '');

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
                if (hashId.substring(0, 5) == "#tag/") {
                    this.showLabel(hashId.substring(5));
                } else {
                    hashId = hashId.substring(1);
                    this.showPlugin(hashId);
                }
            } else {
                this.showPluginList();
            }
        },

        onLoadPluginData(data) {
            window.addEventListener('hashchange', this.onHashChange.bind(this), false);

            let labels = new Set();

            data = _.sortBy(data, pluginData => pluginData.name.toLowerCase());
            this.plugins = data;
            this.plugins.forEach(pluginData => {
                if (pluginData.system_ids.length) {
                    pluginData.dependency = pluginData.system_ids[0] + ':' + pluginData.latest_version;
                }
                pluginData.labels.sort();

                pluginData.labels.forEach(label => {
                    labels.add(label);
                });

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

            $('.labels-section')
                .html(Handlebars.templates['labels']({labels: Array.from(labels)}));

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

        showLabel(labelName) {
            let matches = this.plugins.filter(pluginData => {
                return pluginData.labels.indexOf(labelName) !== -1;
            });
            $('.main-content').children().addClass('hide');
            $('.main-content').find('.plugin-page')
                .removeClass('hide')
                .html(Handlebars.templates['plugins']({plugins: matches}))
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
