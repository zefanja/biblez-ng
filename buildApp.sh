#!/bin/sh
sh tools/deploy.sh
cp manifest.deploy deploy/biblez-ng/manifest.webapp
cd deploy/biblez-ng/
zip -r ../biblez.zip ./
