#!/bin/sh
echo "Building for firefoxOS..."
sh tools/deploy.sh
cp manifest.deploy deploy/biblez-ng/manifest.webapp
cd deploy/biblez-ng/
zip -r ../biblez.zip ./
echo "Building for Firefox"
cd ../..
sh tools/deploy.sh -o github/app
cp manifest.desktop github/app/manifest.webapp
cp biblez.appcache github/app/biblez.appcache
