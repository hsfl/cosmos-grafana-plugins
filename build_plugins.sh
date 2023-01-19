#!/bin/bash

# Builds each plugin folder in the src directory. The created dist folder will be moved to
# a new subdirectory with the same plugin folder name in the build directory.

# Usage: build_plugins.sh [true|false]
# Positional arg 1: Cleanup node_modules and clear yarn cache. True or false. To be used when building the docker image to reduce image size.

CLEANUP=false
if [[ $# -eq 1 && $1 == "true" ]]; then
    CLEANUP=true
fi

mkdir -p build/cosmos-grafana-plugins
rm -rf ./build/cosmos-grafana-plugins/*
# Iterate over every folder in src
cd src
for f in *; do
    # Check if directory
    if [ -d "$f" ]; then
        echo "Found plugin folder $f"
        cd $f
        yarn install
        yarn build

        # Backend datasources must also be built with mage
        if [[ -f "./Magefile.go" ]]; then
            echo "Found Magefile"
            mage -v
        fi

        # Cleanup node_modules folder to reduce size
        if [[ $CLEANUP == true ]]; then
            rm -rf ./node_modules
        fi
        # Move dist folder to build/<PLUGIN_NAME>/dist
        mkdir ../../build/cosmos-grafana-plugins/$f
        mv ./dist ../../build/cosmos-grafana-plugins/$f/

        # Repeat for other plugins
        cd ..
    fi
done

# Clean up yarn cache, which is probably several GiBs by now
if [[ $CLEANUP == true ]]; then
    yarn cache clean
fi
