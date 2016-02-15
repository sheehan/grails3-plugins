grailsplugins.views.FilterDropdownView = class {

    constructor(options) {
        this.options = options;
        this.$el = options.$el;
        this.$el.html(Handlebars.templates['filterDropdown'](options));

        this.$el.find('.search-filter-dropdown-body a').click(this._handleFilterClick.bind(this));

        this.$el.find('.search-filter-dropdown-filter input').keyup(e => {
            let $el = $(e.currentTarget);
            let val = $el.val();
            let $ul = $el.closest('.search-filter-dropdown-body').find('ul');
            $ul.children().each(function() {
                let $li = $(this);
                let match = !val || $li.data('searchText').toLowerCase().indexOf(val) !== -1;
                $li.toggleClass('hide', !match);
            });
            this.$el.find('.no-matches').toggleClass('hide', !!($ul.find('li:not(.hide)').length));
        });
    }

    _handleFilterClick(e) {
        e.preventDefault();
        this.options.onClick(this.options.field, $(e.currentTarget).data('value'));
    }
};
