#!/usr/bin/env bash

if ! command -v web-ext &> /dev/null
then
    echo "web-ext command could not be found, installing globally from npm"
    npm i -g web-ext    
fi

mkdir -p Publish
web-ext build -s FirefoxAddOn/ -a Publish/ -o --filename "sonarr_radarr_lidarr_autosearch-firefox.xpi"
