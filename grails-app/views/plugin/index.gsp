<%@ page import="grails.converters.JSON" %>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.1.0/styles/github.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.css" />

    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Code+Pro:500,700|Open+Sans:400,600" />

    <g:if test="${plugin instanceof Map}">
        <title>${plugin.name}</title>
        <meta name="description" content="${plugin.desc}" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="${asset.assetPath(src: 'grails-logo-light.png', absolute: true)}" />
        <meta property="og:site_name" content="Grails 3 Plugin Portal">
        <meta property="og:title" content="${plugin.name}" />
        <meta property="og:description" content="${plugin.desc}" />
        <meta name="twitter:title" value="${plugin.name}" />
        <meta name="twitter:description" value="${plugin.desc}" />
        <meta name="twitter:site" content="@grails_plugins" />
        <meta name="twitter:card" content="summary">
        <meta name="twitter:image" content="${asset.assetPath(src: 'grails-logo-light.png', absolute: true)}" />

        <g:if test="${plugin.latest_version}">
            <meta name="twitter:label1" value="Latest Version" />
            <meta name="twitter:data1" value="${plugin.latest_version}" />
            <meta name="twitter:label2" value="Published" />
            <meta name="twitter:data2" value="${lastUpdated}" />
        </g:if>
    </g:if>
    <g:else>
        <g:set var="name" value="Grails 3 Plugin Portal" />
        <g:set var="description" value="A portal for searching Grails 3 plugins!" />
        <title>${name}</title>
        <meta name="description" content="${description}" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="${asset.assetPath(src: 'grails-logo-light.png', absolute: true)}" />
        <meta property="og:site_name" content="grails.org">
        <meta property="og:title" content="${name}" />
        <meta property="og:description" content="${description}" />
        <meta name="twitter:title" value="${name}" />
        <meta name="twitter:description" value="${description}" />
        <meta name="twitter:site" content="@grails_plugins" />
        <meta name="twitter:card" content="summary">
        <meta name="twitter:image" content="${asset.assetPath(src: 'grails-logo-light.png', absolute: true)}" />
    </g:else>

    <asset:stylesheet src="manifest.css"/>
    <asset:link rel="shortcut icon" href="favicon.ico" type="image"/>
</head>
<body class="hide">

<g:render template="header" />
<div class="page-loading"><i class="fa fa-cog fa-spin"></i> Loading plugin data...</div>
<div class="main-content page-width hide">
    <div class="sidebar">
        <div class="sidebar-message">
            <h3>Looking for Grails 2 plugins?</h3>
            <p>This portal is for Grails 3 plugins only. For Grails 1 & 2 plugins see <a href="https://grails.org/plugins/">https://grails.org/plugins/</a>.<p>
        </div>
        <div class="timeline-wrapper">
            <a class="twitter-timeline" href="https://twitter.com/grails_plugins" height="600" data-chrome="nofooter"></a>
            <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
        </div>
    </div>
    <div class="search-page">
        <div class="page">
            <div class="search-section">
                <div class="search-input-section">
                    <div class="form-group">
                        <form class="search-form">
                            <input class="search-input form-control" type="text" placeholder="Search Grails 3 plugins...">
                        </form>
                        <span class="glyphicon glyphicon-search form-control-feedback" aria-hidden="true"></span>
                        <span class="glyphicon glyphicon-remove-sign clear-search hide" aria-hidden="true"></span>
                    </div>
                </div>
                <div class="search-results"></div>
            </div>
            <div class="plugin-section hide"></div>
        </div>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/js/bootstrap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.0/handlebars.runtime.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.5/clipboard.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.1.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.1.0/languages/groovy.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/page.js/1.7.1/page.min.js"></script>
<asset:javascript src="manifest.js"/>
<script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-72486221-1', 'auto');
    ga('send', 'pageview');

    window.app = new grailsplugins.App(<%= (json ?: []) as JSON  %>);
</script>
</body>
</html>
