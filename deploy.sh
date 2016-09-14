#!/bin/bash

echo "Grails Plugins Deploy"

rm -rf build

BRANCH=$(git symbolic-ref --short -q HEAD)
VERSION=$(cat version.txt)

if ! git diff-index --quiet HEAD --; then
	echo "FAILED: There are uncommited changes on this repository"
	exit 1
fi

if [ "$BRANCH" = "master" ]; then
    echo "Deploying [$VERSION] to prod"
elif [ "$BRANCH" = "test" ]; then
    echo "Deploying [$VERSION] to test"
else
    echo "FAILED: Unrecognized deploy branch"
    exit 1
fi

git fetch --all

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    if [[ $(git ls-remote --tags | grep "refs/tags/$VERSION") ]]; then
        echo "Tag [$VERSION] already exists"
    else
        echo "Tagging [$VERSION]"
        git tag -a "$VERSION" -m "$VERSION"
        git push origin "$VERSION"
        ./gradlew assemble; rc=$?
        if [ $rc -ne 0 ]; then
          echo "gradle assemble failed."
          exit $rc
        fi
    fi

    eb deploy -l "$VERSION"
    echo "SUCCESS"
elif [ "$LOCAL" = "$BASE" ]; then
    echo "FAILED: Need to pull"
elif [ "$REMOTE" = "$BASE" ]; then
    echo "FAILED: Need to push"
else
    echo "FAILED: Diverged"
fi
