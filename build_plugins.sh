#!/bin/bash

# Builds each plugin folder in the src directory.
# For the distribution version, the created dist folder will be moved to
# a new subdirectory with the same plugin folder name in the build directory.

# Usage: build_plugins.sh [--dist] [--cleanup]
# Options:
# dist: Builds and moves folders
# cleanup: Cleans up everything except the dist folders. True or false. To be used when building the docker image for release to reduce image size.


DIST_BUILD=false
CLEANUP=false
for arg in "$@"
do
    if [[ "$arg" == "--dist" ]]; then
        DIST_BUILD=true
    elif [[ "$arg" == "--cleanup" ]]; then
        CLEANUP=true
    fi
done

if [[ $DIST_BUILD == true ]]; then
    # Move all dist folders to the build folder for release
    mkdir -p build/cosmos-grafana-plugins
    rm -rf ./build/cosmos-grafana-plugins/*
fi

# Iterate over every folder in src
cd src
for f in *; do
    # Check if directory
    if [ -d "$f" ]; then
        echo "Found plugin folder $f"
        cd $f

        # Backend datasources must also be built with mage
        if [[ -f "./Magefile.go" ]]; then
            echo "Found Magefile"
            mage -v
        fi

        # Build frontend part of plugin
        yarn install
        yarn build

        if [[ $DIST_BUILD == true ]]; then
            mkdir ../../build/cosmos-grafana-plugins/$f
            if [[ $CLEANUP == true ]]; then
                # Move dist folder to build/<PLUGIN_NAME>/dist
                mv ./dist ../../build/cosmos-grafana-plugins/$f/
            else
                # Copy dist folder to build/<PLUGIN_NAME>/dist
                cp -r ./dist ../../build/cosmos-grafana-plugins/$f/
            fi
        fi

        # Repeat for other plugins
        cd ..
    fi
done

# Clean up yarn cache, which is probably several GiBs by now. And other cache while we're at it.
if [[ $CLEANUP == true ]]; then
    # Cleanup src folder to reduce image size
    cd ..
    rm -rf src/
    yarn cache clean
    rm -rf /usr/local/.cache/*
    rm -rf /root/.cache/*
fi
