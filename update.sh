#!/bin/bash

#export BINTRAY_USER=x
#export BINTRAY_PASS=x

#export TWITTER_CONSUMER_KEY=x
#export TWITTER_CONSUMER_KEY_SECRET=x
#export TWITTER_ACCESS_TOKEN=x
#export TWITTER_ACCESS_TOKEN_SECRET=x

git checkout master

echo "Starting Grails 3 Plugins Update..."

if ! git diff-index --quiet HEAD --; then
    echo "FAILED: There are uncommited changes"
    exit 1
fi

BRANCH=$(git symbolic-ref --short -q HEAD)

if [ "$BRANCH" != "master" ]; then
    echo "FAILED: Run on master branch"
    exit 1
fi

groovy src/groovy/Fetch ./data/plugins.new.json
#groovy src/groovy/Compare ./data/plugins.json ./data/plugins.new.json

mv ./data/plugins.new.json ./data/plugins.json

git add ./data/plugins.json
git commit -m 'Updating plugin data'
git push --force --quiet "https://${GITHUB_TOKEN}@$github.com/${GITHUB_REPO}.git" origin master

./update-ghpages.sh