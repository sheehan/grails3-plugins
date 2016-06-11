Handlebars.registerHelper('fromNow', string => string ? moment(string).fromNow() : '');

Handlebars.registerHelper('quoteIfWhitespace', string =>  /\s/.test(string) ? `"${string}"` : string);

Handlebars.registerHelper('baseUrl', () =>  app.baseUrl);

let grailsplugins = {
    views: {}
};