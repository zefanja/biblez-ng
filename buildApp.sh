#!/bin/sh
echo "\033[1;32mBuilding for firefoxOS...\033[0m"
sh tools/deploy.sh
cp manifest.deploy deploy/biblez-ng/manifest.webapp
cd deploy/biblez-ng/
zip -r -q ../biblez.zip ./
echo "\033[1;32mBuilding for Firefox\033[0m"
cd ../..
#sh tools/deploy.sh -o github/app
rm -R github/app
mkdir -p github/app
cp -a deploy/biblez-ng/. github/app
cp manifest.desktop github/app/manifest.webapp
cp biblez.appcache github/app/biblez.appcache
echo "\033[1;32mDone! You'll find the app in github/app\033[0m"
