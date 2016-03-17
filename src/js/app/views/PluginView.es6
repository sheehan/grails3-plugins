grailsplugins.views.PluginView = class {

    constructor($el) {
        this.$el = $el;
    }

    showPlugin(plugin) {
        this.clipboard && this.clipboard.destroy();

        if (plugin) {
            this.$el.html(Handlebars.templates['plugin'](_.extend({baseUrl: app.baseUrl}, plugin)));
            if (plugin.githubRepo) {
                $.ajax({
                    url:     `https://api.github.com/repos/${plugin.githubRepo.full_name}/readme`,
                    headers: {'Accept': 'application/vnd.github.VERSION.html'},
                    type:    'GET'
                }).done(html => {
                    this.$el.find('.readme').html(html);
                    this.$el.find('.readme a').attr('target', '_top');
                }).fail(jqXhr => {
                    if (jqXhr.status === 404) {
                        this._showReadmeNotAvailable();
                    }
                });
            } else {
                this._showReadmeNotAvailable();
            }


            if (plugin.dependency) {
                var $copy = this.$el.find('.clippy');

                if ($copy.length) {
                    this.clipboard = new Clipboard($copy[0]);

                    $copy.tooltip({
                        title:   'Copied!',
                        trigger: 'manual'
                    });

                    $copy.click(e => {
                        e.preventDefault();
                        $copy.tooltip('show');
                        _.delay(() => $copy.tooltip('hide'), 2000);
                    });
                }

                this.$el.find('.hljs').each(function (i, block) {
                    hljs.highlightBlock(block);
                });
            }
        } else {
            this.$el.html(Handlebars.templates['pluginNotFound']);
        }
    }

    _showReadmeNotAvailable() {
        this.$el.find('.readme').html('<span class="not-found">Readme not available.</span>');
    }
};
