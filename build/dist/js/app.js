'use strict';

(function ($) {

    Handlebars.registerHelper('fromNow', function (string) {
        return string ? moment(string).fromNow() : '';
    });

    window.App = {
        initialize: function initialize() {
            $.get('data/plugins.json').then(this.onLoadPluginData.bind(this));
            return this;
        },
        onHashChange: function onHashChange(e) {
            e.preventDefault();
            e.stopPropagation();
            this.route();
        },
        route: function route() {
            var hashId = window.location.hash;
            if (hashId) {
                hashId = hashId.substring(1);
                this.showPlugin(hashId);
            } else {
                this.showPluginList();
            }
        },
        onLoadPluginData: function onLoadPluginData(data) {
            var _this = this;

            window.addEventListener('hashchange', this.onHashChange.bind(this), false);

            data = _.sortBy(data, function (pluginData) {
                return pluginData.name.toLowerCase();
            });
            this.plugins = data;
            this.plugins.forEach(function (pluginData) {
                if (pluginData.system_ids.length) {
                    pluginData.dependency = pluginData.system_ids[0] + ':' + pluginData.latest_version;
                }
                pluginData.labels.sort();
                pluginData.bintrayHref = 'https://bintray.com/' + pluginData.owner + '/' + pluginData.repo + '/' + pluginData.name;
                if (pluginData.vcs_url.indexOf('github') !== -1) {
                    pluginData.githubHref = pluginData.vcs_url;

                    var matchResult = pluginData.vcs_url.match(/.*github\.com\/([^\/]+\/[^\/]+)/);
                    if (matchResult) {
                        pluginData.githubRepo = matchResult[1];
                    }
                }
            });

            $('.search-input').keyup(this.doSearch.bind(this));
            $('.clear-search').click(function (event) {
                event.preventDefault();
                $('.search-input').val('');
                _this.doSearch();
            });

            this.doSearch();
            this.route();
        },
        showPluginList: function showPluginList() {
            $('.main-content').children().addClass('hide');
            $('.main-content').find('.list-page').removeClass('hide');
        },
        showPlugin: function showPlugin(pluginName) {
            var plugin = _.find(this.plugins, function (plugin) {
                return plugin.name === pluginName;
            });
            $('.main-content').children().addClass('hide');
            $('.main-content').find('.plugin-page').removeClass('hide').html(Handlebars.templates['plugin'](plugin));
            if (plugin.githubRepo) {
                $.ajax({
                    url: 'https://api.github.com/repos/' + plugin.githubRepo + '/readme',
                    headers: { 'Accept': 'application/vnd.github.VERSION.html' },
                    type: 'GET'
                }).done(function (html) {
                    $('.plugin-page .readme').html(html);
                }).fail(function (jqXhr) {
                    if (jqXhr.status === 404) {
                        console.log('readme not available');
                    }
                });
            }

            if (plugin.dependency) {
                (function () {
                    new Clipboard('.plugin-page .dependency-clip .clippy', {
                        text: function text(trigger) {
                            return $(trigger).closest('.input-group').find('input').val();
                        }
                    });
                    // clipboard.destroy();
                    var $clippy = $('.plugin-page .dependency-clip .clippy');
                    $clippy.tooltip({
                        title: 'Copied!',
                        trigger: 'manual'
                    });

                    $clippy.click(function (e) {
                        e.preventDefault();
                        $clippy.tooltip('show');
                        _.delay(function () {
                            return $clippy.tooltip('hide');
                        }, 2000);
                    });
                })();
            }
        },
        doSearch: function doSearch() {
            var val = $('.search-input').val();
            $('.clear-search').toggleClass('hide', !val);

            var matches = this.plugins;
            if (val) {
                matches = this.plugins.filter(function (pluginData) {
                    return pluginData.name.toLowerCase().indexOf(val.toLowerCase()) !== -1 || pluginData.labels.some(function (label) {
                        return label.toLowerCase().indexOf(val.toLowerCase()) !== -1;
                    });
                });
            }

            $('.search-results').html('').append(Handlebars.templates['plugins']({ plugins: matches }));
        }
    }.initialize();
})(jQuery);
this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["plugin"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "                <a href=\""
    + escapeExpression(((helper = (helper = helpers.githubHref || (depth0 != null ? depth0.githubHref : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"githubHref","hash":{},"data":data}) : helper)))
    + "\"><img src=\"src/img/plainicon.com-50224-svg.svg\"></a>\n";
},"3":function(depth0,helpers,partials,data) {
  var stack1, buffer = "        <div class=\"plugin-labels\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.labels : depth0), {"name":"each","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </div>\n";
},"4":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "                <span class=\"label\">"
    + escapeExpression(lambda(depth0, depth0))
    + "</span>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"plugin-info\">\n    <div>\n        <a class=\"plugin-name\" href=\"#\" data-id=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</a>\n\n        <div class=\"input-group dependency-clip\">\n            <input type=\"text\" class=\"form-control\" value=\""
    + escapeExpression(((helper = (helper = helpers.dependency || (depth0 != null ? depth0.dependency : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"dependency","hash":{},"data":data}) : helper)))
    + "\" readonly>\n            <div class=\"input-group-addon btn clippy\"><span class=\"glyphicon glyphicon-copy\" aria-hidden=\"true\"></span></div>\n        </div>\n        <span class=\"external-links \">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.githubHref : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "            <a href=\""
    + escapeExpression(((helper = (helper = helpers.bintrayHref || (depth0 != null ? depth0.bintrayHref : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"bintrayHref","hash":{},"data":data}) : helper)))
    + "\"><img src=\"src/img/plainicon.com-50186-svg.svg\"></a>\n        </span>\n    </div>\n    <span class=\"plugin-description\">"
    + escapeExpression(((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"desc","hash":{},"data":data}) : helper)))
    + "</span>\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.labels : depth0), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    <div>\n        <label>version</label>\n        <span class=\"\">"
    + escapeExpression(((helper = (helper = helpers.latest_version || (depth0 != null ? depth0.latest_version : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"latest_version","hash":{},"data":data}) : helper)))
    + "</span>\n        <label>updated</label>\n        <span class=\"plugin-updated\">"
    + escapeExpression(((helpers.fromNow || (depth0 && depth0.fromNow) || helperMissing).call(depth0, (depth0 != null ? depth0.updated : depth0), {"name":"fromNow","hash":{},"data":data})))
    + "</span>\n        <label>owner</label>\n        <span class=\"\">"
    + escapeExpression(((helper = (helper = helpers.owner || (depth0 != null ? depth0.owner : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"owner","hash":{},"data":data}) : helper)))
    + "</span>\n    </div>\n</div>\n<div class=\"readme\"></div>";
},"useData":true});
this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["plugins"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "        <li>\n            <div>\n                <a class=\"plugin-name\" href=\"#"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</a>\n                <!--<span class=\"plugin-dependency pull-right\"><code>"
    + escapeExpression(((helper = (helper = helpers.dependency || (depth0 != null ? depth0.dependency : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"dependency","hash":{},"data":data}) : helper)))
    + "</code></span>-->\n                <span class=\"external-links \">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.githubHref : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "                    <a href=\""
    + escapeExpression(((helper = (helper = helpers.bintrayHref || (depth0 != null ? depth0.bintrayHref : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"bintrayHref","hash":{},"data":data}) : helper)))
    + "\"><img src=\"src/img/plainicon.com-50186-svg.svg\"></a>\n                </span>\n            </div>\n            <span class=\"plugin-description\">"
    + escapeExpression(((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"desc","hash":{},"data":data}) : helper)))
    + "</span>\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.labels : depth0), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "            <div>\n                <label>version</label>\n                <span class=\"\">"
    + escapeExpression(((helper = (helper = helpers.latest_version || (depth0 != null ? depth0.latest_version : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"latest_version","hash":{},"data":data}) : helper)))
    + "</span>\n                <label>updated</label>\n                <span class=\"plugin-updated\">"
    + escapeExpression(((helpers.fromNow || (depth0 && depth0.fromNow) || helperMissing).call(depth0, (depth0 != null ? depth0.updated : depth0), {"name":"fromNow","hash":{},"data":data})))
    + "</span>\n                <label>owner</label>\n                <span class=\"\">"
    + escapeExpression(((helper = (helper = helpers.owner || (depth0 != null ? depth0.owner : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"owner","hash":{},"data":data}) : helper)))
    + "</span>\n            </div>\n        </li>\n";
},"2":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "                        <a href=\""
    + escapeExpression(((helper = (helper = helpers.githubHref || (depth0 != null ? depth0.githubHref : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"githubHref","hash":{},"data":data}) : helper)))
    + "\"><img src=\"src/img/plainicon.com-50224-svg.svg\"></a>\n";
},"4":function(depth0,helpers,partials,data) {
  var stack1, buffer = "                <div class=\"plugin-labels\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.labels : depth0), {"name":"each","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "                </div>\n";
},"5":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "                        <span class=\"label\">"
    + escapeExpression(lambda(depth0, depth0))
    + "</span>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<ul class=\"plugins-list\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.plugins : depth0), {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</ul>";
},"useData":true});