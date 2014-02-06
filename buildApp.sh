#!/bin/sh
echo "\033[1;32mBuilding for firefoxOS...\033[0m"
sh tools/deploy.sh
cp manifest.deploy deploy/biblez-ng/manifest.webapp
cd deploy/biblez-ng/
zip -r -q ../biblez.zip ./
echo "\033[1;32mBuilding for Firefox\033[0m"
cd ../..
sh tools/deploy.sh -o github/app
cp manifest.desktop github/app/manifest.webapp
cp biblez.appcache github/app/biblez.appcache
