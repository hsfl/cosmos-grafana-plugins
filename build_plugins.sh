#!/bin/bash

# Builds each plugin folder in the src directory.
# For the distribution version, the created dist folder will be moved to
# a new subdirectory with the same plugin folder name in the build directory.

# Usage: build_plugins.sh [--dist] [--cleanup]
# Options:
# dist: Builds and moves folders
# clean-build: Builds afresh, deletes dist folder first
# cleanup: Cleans up everything except the dist folders. True or false. To be used when building the docker image for release to reduce image size.


DIST_BUILD=false
CLEANBUILD=false
CLEANUP=false
for arg in "$@"
do
    if [[ "$arg" == "--dist" ]]; then
        echo "--dist flag set"
        DIST_BUILD=true
    elif [[ "$arg" == "--clean-build" ]]; then
        echo "--clean-build flag set"
        CLEANBUILD=true
    elif [[ "$arg" == "--cleanup" ]]; then
        echo "--cleanup flag set"
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

        # Remove dist folder first for a clean build
        if [[ $CLEANBUILD == true && -d "./dist" ]]; then
            echo "Removing existing dist folder"
            rm -rf ./dist
        fi

        # Backend datasources must also be built with mage
        if [[ -f "./Magefile.go" ]]; then
            echo "Found Magefile"
            mage -v
        fi

        # Build frontend part of plugin
        yarn install
        yarn build

        # If build was successful
        if [[ -d "./dist" ]]; then
            if [[ $DIST_BUILD == true ]]; then
                echo "Making dist folder in ../../build/cosmos-grafana-plugins/$f"
                mkdir ../../build/cosmos-grafana-plugins/$f
                if [[ $CLEANUP == true ]]; then
                    # Move dist folder to build/<PLUGIN_NAME>/dist
                    echo "Moving dist folder"
                    mv ./dist ../../build/cosmos-grafana-plugins/$f/
                else
                    # Copy dist folder to build/<PLUGIN_NAME>/dist
                    echo "Copying dist folder"
                    cp -r ./dist ../../build/cosmos-grafana-plugins/$f/
                fi
            fi
        fi

        # Repeat for other plugins
        echo "Leaving plugin folder $f"
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
