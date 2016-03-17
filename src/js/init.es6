Handlebars.registerHelper('fromNow', string => string ? moment(string).fromNow() : '');

Handlebars.registerHelper('quoteIfWhitespace', string =>  /\s/.test(string) ? `"${string}"` : string);

Handlebars.registerHelper('baseUrl', () =>  {
    return app.baseUrl;
});

/*
 * Grab metadata from repo attributes to create build.gradle syntax.
 * Example metadata:
 * "attribute_names": [
 *  {"name": "pluginScope", "values" : ["compile"], "type": "string"}
 * ]
 */
Handlebars.registerHelper('gradleFormat', function(plugin){
    var pluginScope = "";
    // TODO: implement these
    var buildScript = "";
    var applyPlugin = "";
    var sourceSets = "";

    return buildScript + applyPlugin + pluginScope + sourceSets;
});

let grailsplugins = {
    views: {}
};