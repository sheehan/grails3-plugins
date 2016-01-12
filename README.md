Grails 3 Plugins
---

This project is a static website that provides a better viewing experience for Grails 3 plugins which are hosted in the [Grails plugins repo in Bintray](https://bintray.com/grails/plugins). The purpose is to make it quicker and easier to find and use Grails 3 plugins!

It is published as a static site at: <http://sheehan.github.io/grails3-plugins/>

## Getting started

### Frontend

```bash
# Install js dependancies
$ npm install
# This Gulp task starts up a local server with live-reload.
$ gulp connect
...
[08:00:00] Server started http://localhost:8080
```

### Gathering data

```bash
$ export BINTRAY_USER=youruser
$ export BINTRAY_PASS=apikey
$ groovy src/groovy/fetch.groovy
```
The data is stored under `data/plugins.json`

## Ideas

* possibly add tags as facets on the left
* ability to sort plugins by date updated
* possibly add recent activity panel?
* investigate what other Bintray and github data could be useful to display in search results or detail
* script to update data
* script to diff data and generate tweets & recent-activity.json
* Add metadata Plugins that need `buildscript` dependancies and/or `runtime` vs `compile`  (such as ap or dbm)
