#!/bin/bash
# Release script for kibana-mithril.
# usage: ./release.sh 7.0.0 ubuntu
# $1 the parameter indicates the version we are building for.
# $2 the platform we are building for.

version=$1
tmp_file='tmp.json'
platform=$2

if [ -z "$platform" ]
	then
		os=$(uname -o)
		arch=$(uname -m)

		if [ "$os" = "Msys" ]
			then
				os="windows"
		fi

		platform="$os-$arch"
		platform="${platform/\//.}"
fi

if [ -z "$version" ] 
	then
		echo 'usage: ./release.sh <kibana-version>'
		exit 0
fi

# make sure npm install is invoked before building the distribution.
# npm install - runs before building the distributions on travis.

# set the version in the package.json and config.json 
# this must match the version of kibana.
jq --arg version $version '.version = $version' package.json > $tmp_file && mv $tmp_file package.json
jq --arg version $version '.authentication.kbnVersion = $version' config.json > $tmp_file && mv $tmp_file config.json

# create output folders.
mkdir -p build/dist
mkdir -p build/kibana/

# need some extra directories in the zip to make the plugin loader happy.
ln -sf $(pwd) ./build/kibana/kibana-mithril

zip -r build/dist/mithril-$platform-$version.zip ./* -x "/build/*"