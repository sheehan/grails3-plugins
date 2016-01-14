#!/bin/bash

#export BINTRAY_USER=x
#export BINTRAY_PASS=x

#export TWITTER_CONSUMER_KEY=x
#export TWITTER_CONSUMER_KEY_SECRET=x
#export TWITTER_ACCESS_TOKEN=x
#export TWITTER_ACCESS_TOKEN_SECRET=x

# TODO get latest master

groovy src/groovy/Fetch ./data/plugins.new.json
groovy src/groovy/Compare ./data/plugins.json ./data/plugins.new.json

mv ./data/plugins.new.json ./data/plugins.json

# TODO commit & push updated data

./update-ghpages.sh