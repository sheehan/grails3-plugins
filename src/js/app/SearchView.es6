grailsplugins.SearchView  = class {

    constructor($el, plugins) {
        this.$el = $el;
        this.plugins = plugins;
        this.sort = 'name';

        $el.find('.labels-section')
            .html(Handlebars.templates['labels']({labels: this.plugins.getLabels()}));

        $el.find('.search-input').keyup(this.doSearch.bind(this));
        $el.find('.search-form').submit(e => {
            e.preventDefault();
            let val = this.$el.find('.search-input').val();
            window.location.href = `#q/${val}`;
        });
        $el.find('.clear-search').click(event => {
            event.preventDefault();
            if (window.location.hash) {
                window.location.href = '#';
            } else {
                this.search('');
            }
        });

        $el.delegate('.search-select .dropdown-menu a', 'click', e => {
            e.preventDefault();
            this.sort = $(e.currentTarget).data('sort');
            this.doSearch();
        });

        this.doSearch();
    }

    search(value) {
        this.$el.find('.search-input').val(value);
        this.doSearch();
    }

    doSearch() {
        let val = this.$el.find('.search-input').val();
        this.$el.find('.clear-search').toggleClass('hide', !val);

        let matches = this.plugins.search(val, this.sort);

        let searchCount;
        if (!val) {
            searchCount = `Showing all ${matches.length} plugins`;
        } else if (!matches.length) {
            searchCount = 'No matching plugins';
        } else {
            searchCount = `Showing ${matches.length} matching ${matches.length === 1 ? 'plugin' : 'plugins'}`;
        }

        this.$el.find('.search-results').html(Handlebars.templates['plugins']({
            plugins: matches,
            searchCount: searchCount
        }));

        this.$el.find(`.search-select .dropdown-menu a[data-sort="${this.sort}"]`).addClass('selected');
    }
};
