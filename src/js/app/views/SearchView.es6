grailsplugins.views.SearchView = class {

    constructor($el, plugins) {
        this.$el = $el;
        this.plugins = plugins;

        this.query = new grailsplugins.Query();

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
    }

    search(value) {
        let decoded = decodeURIComponent(value.replace(/\+/g, '%20'));
        this.$el.find('.search-input').val(decoded);
        this.doSearch();
    }

    doSearch() {
        let val = this.$el.find('.search-input').val();
        let query = new grailsplugins.Query(val);
        this.$el.find('.clear-search').toggleClass('hide', !val);

        let matches = this.plugins.search(query);

        let searchCount;
        if (!val) {
            searchCount = `Showing all ${matches.length} plugins`;
        } else if (!matches.length) {
            searchCount = 'No matching plugins';
        } else {
            searchCount = `Showing ${matches.length} matching ${matches.length === 1 ? 'plugin' : 'plugins'}`;
        }

        this.$el.find('.search-results').html(Handlebars.templates['plugins']({
            baseUrl: app.baseUrl,
            plugins: matches,
            searchCount: searchCount
        }));

        let label = query.getField('label');
        new grailsplugins.views.FilterDropdownView({
            $el: this.$el.find('.dropdown.labels'),
            label: 'Label',
            headerLabel: 'Filter by label',
            placeholder: 'Filter labels',
            items: this.plugins.getLabelCounts().map(it => ({
                name: it.name,
                value: it.name,
                count: it.count,
                selected: label === it.name
            })),
            field: 'label',
            onClick: this.onFilterClick.bind(this)
        });

        let owner = query.getField('owner');
        new grailsplugins.views.FilterDropdownView({
            $el: this.$el.find('.dropdown.owners'),
            label: 'Owner',
            headerLabel: 'Filter by owner',
            placeholder: 'Filter owners',
            items: this.plugins.getOwnerCounts().map(it => ({
                name: it.name,
                value: it.name,
                count: it.count,
                selected: owner === it.name
            })),
            field: 'owner',
            onClick: this.onFilterClick.bind(this)
        });

        let sort = query.getSort() || 'name';
        new grailsplugins.views.FilterDropdownView({
            $el: this.$el.find('.dropdown.sort'),
            label: 'Sort',
            headerLabel: 'Sort by',
            items: [
                {name: 'Name', value: 'name', selected: sort === 'name'},
                {name: 'Date', value: 'date', selected: sort === 'date'},
                {name: 'Stars', value: 'stars', selected: sort === 'stars'}
            ],
            field: 'sort',
            onClick: this.onFilterClick.bind(this)
        });
    }

    onFilterClick(field, value) {
        let val = this.$el.find('.search-input').val();
        let query = new grailsplugins.Query(val);
        query.toggleField(field, value);
        window.location.href = `#q/${encodeURIComponent(query.getQueryString()).replace(/%20/g, '+')}`;
    }
};
