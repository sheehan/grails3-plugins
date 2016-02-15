describe('grailsplugins.Query', () => {

    it('can getTokens()', () => {
        [
            ['foo',                     {q: 'foo'}],
            ['foo author:xxx',          {q: 'foo', author: 'xxx'}],
            ['foo author:"y y"',        {q: 'foo', author: 'y y'}]
        ].forEach(([queryString, expected]) => {
            let query = new grailsplugins.Query(queryString);
            expect(query.getParams()).toEqual(expected);
        });
    });

    it('can toggleField()', () => {
        let query = new grailsplugins.Query();
        query.toggleField('label', 'xxx');
        expect(query.getParams()).toEqual({label: 'xxx'});

        query.toggleField('owner', 'yyy');
        expect(query.getParams()).toEqual({label: 'xxx', owner: 'yyy'});

        query.toggleField('label', 'xxx');
        expect(query.getParams()).toEqual({owner: 'yyy'});

        query.toggleField('owner', 'xxx');
        expect(query.getParams()).toEqual({owner: 'xxx'});
    });

    it('can getQueryString() and quote spaces', () => {
        let query = new grailsplugins.Query();
        query.toggleField('label', 'font awesome');
        query.toggleField('owner', 'xxx');
        expect(query.getQueryString()).toBe('label:"font awesome" owner:xxx');
    });
});