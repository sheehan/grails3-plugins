rm-rf build/gh-pages
mkdir -p build/gh-pages
cd build/gh-pages
git clone git@github.com:sheehan/grails3-plugins.git
git checkout gh-pages2
git rebase master

npm install
gulp build

git add build/ -f
git commit -m "build files"
git push
