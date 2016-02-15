grailsplugins.Query = class {

    constructor(queryString = '') {
        this._parseQueryString(queryString);
    }

    toggleField(field, value) {
        if (field === 'sort') {
            if (this._sort === value) {
                delete this._sort;
            } else {
                this._sort = value;
            }
        } else {
            if (this._params[field] === value) {
                delete this._params[field];
            } else {
                this._params[field] = value;
            }
        }
    }

    _parseQueryString(queryString) {
        let params = {};

        let tokens = queryString.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);

        _.chain(tokens).filter().forEach(token => {
            let key, value;

            let match = /(.*):"?([^"]*)"?/.exec(token);
            if (match) {
                [, key, value] = match;
            } else {
                key = 'q';
                value = token;
            }

            if (value) {
                if (key === 'sort') {
                    this._sort = value;
                } else {
                    params[key] = value;
                }
            }
        });

        this._params = params;
    }

    getParams() {
        return this._params;
    }

    getField(field) {
        return this._params[field];
    }

    getSort() {
        return this._sort;
    }

    getQueryString() {
        let tokens = _.map(this._params, (v, k) => {
            v = /\s/.test(v) ? `"${v}"` : v;
            return k === 'q' ? v : `${k}:${v}`;
        });

        if (this._sort) {
            tokens.push(`sort:${this._sort}`);
        }

        return tokens.join(' ');
    }
};