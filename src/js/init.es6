Handlebars.registerHelper('fromNow', string => string ? moment(string).fromNow() : '');

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

    plugin.attribute_names.forEach(function (attributes) {
        if(attributes.name == "pluginScope" && plugin.dependency) {
            pluginScope += "\ndependencies {\n";
            pluginScope += "    " + attributes.values + " '" + plugin.dependency + "'\n";
            pluginScope += "}\n";
        }
    });

    if(pluginScope == "" && plugin.dependency) {
        pluginScope += "\ndependencies {\n";
        pluginScope += "    compile '" + plugin.dependency + "'\n";
        pluginScope += "}\n";
    }

    return buildScript + applyPlugin + pluginScope + sourceSets;
});