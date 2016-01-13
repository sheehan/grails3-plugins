#!/bin/bash

echo "Starting Grails 3 Plugins Deploy..."

if ! git diff-index --quiet HEAD --; then
	echo "FAILED: There are uncommited changes"
	exit 1
fi

BRANCH=$(git symbolic-ref --short -q HEAD)

if [ "$BRANCH" != "master" ]; then
	echo "FAILED: Run on master branch"
    exit 1
fi

if [ `git branch --list gh-pages ` ]; then
   git branch -D gh-pages
fi

git fetch --all
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    git checkout -b gh-pages
    npm install
    rm -rf build
    gulp clean build
    git add build/ -f
    git commit -m 'Deploying latest to GitHub pages'
    git push -f origin gh-pages
    git checkout master
elif [ "$LOCAL" = "$BASE" ]; then
    echo "FAILED: Need to pull"
    exit 1
elif [ "$REMOTE" = "$BASE" ]; then
    echo "FAILED: Need to push"
    exit 1
else
    echo "FAILED: Diverged"
    exit 1
fi

echo "...Finished Grails 3 Plugins Deploy"
