rm -rf build/gh-pages
mkdir -p build/gh-pages
cd build/gh-pages
git clone git@github.com:sheehan/grails3-plugins.git
cd grails3-plugins
git checkout gh-pages
git reset --hard origin/master

npm install
gulp build

git add build/ -f
git commit -m "build files"
git push -f
