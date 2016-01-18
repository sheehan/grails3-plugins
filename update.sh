#!/bin/bash

#export BINTRAY_USER=x
#export BINTRAY_PASS=x

#export TWITTER_CONSUMER_KEY=x
#export TWITTER_CONSUMER_KEY_SECRET=x
#export TWITTER_ACCESS_TOKEN=x
#export TWITTER_ACCESS_TOKEN_SECRET=x


### 
# Go to travis and enable builds for this repo
# First remove all secure: env from the travis file
# Run the following in the root directory with the corrected values to get the .travis.yaml updated
#
# travis encrypt -r sheehan/grails3-plugins GITHUB_REPO=sheehan/grails3-plugins --add
# travis encrypt -r sheehan/grails3-plugins BINTRAY_USER=xxxx --add
# travis encrypt -r sheehan/grails3-plugins BINTRAY_PASS=xxxx --add
# travis encrypt -r sheehan/grails3-plugins GITHUB_USER=xxxx --add
# travis encrypt -r sheehan/grails3-plugins GITHUB_PASS=xxxx --add
# travis encrypt -r sheehan/grails3-plugins TWITTER_CONSUMER_KEY=xxxx --add
# travis encrypt -r sheehan/grails3-plugins TWITTER_CONSUMER_KEY_SECRET=xxxx --add
# travis encrypt -r sheehan/grails3-plugins TWITTER_ACCESS_TOKEN=xxxx --add
# travis encrypt -r sheehan/grails3-plugins TWITTER_ACCESS_TOKEN_SECRET=xxxx --add

git checkout master

### Update as needed
git config --global user.email "acetrike@gmail.com"
git config --global user.name "Christian Oestreich"

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
groovy src/groovy/Compare ./data/plugins.json ./data/plugins.new.json

mv ./data/plugins.new.json ./data/plugins.json

git add ./data/plugins.json
git commit -m 'Updating plugin data'
git push --force --quiet "https://${GITHUB_USER}:${GITHUB_PASS}@github.com/${GITHUB_REPO}.git"

./update-ghpages.sh