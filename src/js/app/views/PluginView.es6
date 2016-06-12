grailsplugins.views.PluginView = class {

    constructor($el) {
        this.$el = $el;
    }

    showPlugin(plugin) {
        this.clipboard && this.clipboard.destroy();

        if (!plugin) {
            this.$el.html(Handlebars.templates['pluginNotFound']);
            return;
        }
        
        this.$el.html(Handlebars.templates['plugin'](plugin));
        if (plugin.website_url) {
            this.$el.find('.docs-message')
                .removeClass('hide')
                .html(Handlebars.templates['pluginDocs'](plugin));
        } else if (plugin.githubRepo) {
            $.ajax({
                url:     `https://api.github.com/repos/${plugin.githubRepo.full_name}/readme`,
                headers: {'Accept': 'application/vnd.github.VERSION.html'},
                type:    'GET'
            }).done(html => {
                this.$el.find('.readme').removeClass('hide');
                this.$el.find('.readme-body').html(html);
                this.$el.find('.readme-body a').attr('target', '_top');

                var regex = new RegExp('^(?:[a-z]+:)?//', 'i');
                this.$el.find('.readme-body img').each((i, e) => {
                    let imgSrc = e.getAttribute('src');
                    if (!regex.test(imgSrc)) {
                        e.setAttribute('src', `https://github.com/${plugin.githubRepo.full_name}/raw/master/${imgSrc}`);
                    }
                });
            }).fail(jqXhr => {
                if (jqXhr.status === 404) {
                    this.showDocumentationNotAvailable();
                }
            });
        } else {
            this.showDocumentationNotAvailable();
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
    }

    showDocumentationNotAvailable() {
        this.$el.find('.docs-message')
            .removeClass('hide')
            .html('<span class="not-found">Documentation not available.</span>');
    }
};
