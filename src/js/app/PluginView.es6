grailsplugins.PluginView = class {

    constructor($el) {
        this.$el = $el;
    }

    showPlugin(plugin) {
        this.clipboard && this.clipboard.destroy();

        if (plugin) {
            this.$el.html(Handlebars.templates['plugin'](plugin));
            if (plugin.githubRepo) {
                $.ajax({
                    url:     `https://api.github.com/repos/${plugin.githubRepo}/readme`,
                    headers: {'Accept': 'application/vnd.github.VERSION.html'},
                    type:    'GET'
                }).done(html => {
                    this.$el.find('.readme').html(html);
                }).fail(jqXhr => {
                    if (jqXhr.status === 404) {
                        this.$el.find('.readme').html('<span class="not-found">Readme not available.</span>');
                    }
                });
            }

            if (plugin.dependency) {
                this.clipboard = new Clipboard('.plugin-page .dependency-clip .clippy', {
                    text: function (trigger) {
                        return $(trigger).closest('.input-group').find('input').val();
                    }
                });

                let $clippy = this.$el.find('.clippy');
                $clippy.tooltip({
                    title:   'Copied!',
                    trigger: 'manual'
                });

                $clippy.click(e => {
                    e.preventDefault();
                    $clippy.tooltip('show');
                    _.delay(() => $clippy.tooltip('hide'), 2000);
                });

                this.$el.find('.hljs').each(function(i, block) {
                    hljs.highlightBlock(block);
                });
            }
        } else {
            this.$el.html(Handlebars.templates['pluginNotFound']);
        }
    }
};
