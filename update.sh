#!/bin/bash

#export BINTRAY_USER=x
#export BINTRAY_PASS=x

#export GITHUB_USER=x
#export GITHUB_PASS=x

#export TWITTER_CONSUMER_KEY=x
#export TWITTER_CONSUMER_KEY_SECRET=x
#export TWITTER_ACCESS_TOKEN=x
#export TWITTER_ACCESS_TOKEN_SECRET=x

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

git remote update
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

git pull
groovy src/groovy/Fetch ./data/plugins.new.json
groovy src/groovy/Compare ./data/plugins.json ./data/plugins.new.json

mv ./data/plugins.new.json ./data/plugins.json

if [ -n "$(git status --porcelain)" ]; then
    echo "INFO: There are plugin updates"
    git add ./data/plugins.json
    git commit -m 'Updating plugin data'
    git push origin master
    ./update-ghpages.sh
elif [ "$LOCAL" != "$REMOTE" ]; then
    echo "INFO: There are code changes"
    ./update-ghpages.sh
else
    echo "INFO: No code changes or plugin updates"
fi
