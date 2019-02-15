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
jq --arg version $version '.kibana.version = $version' package.json > $tmp_file && mv $tmp_file package.json
jq --arg version $version '.authentication.kbnVersion = $version' config.json > $tmp_file && mv $tmp_file config.json

dist="./build/dist/"
build="./build/"
plugin_root="./build/kibana/kibana-mithril/"

# clear previous builds
if [ -e "$output" ];
	then
		rm "$output"
fi

# create output folders.
mkdir -p $dist
mkdir -p $plugin_root

# need some extra directories in the zip to make the plugin loader happy.
# if we were using the plugin-helpers there is a task to zip it up.
# we don't want to use it because it's not published to npm and requires a full
# checkout and yarn bootstrap of kibana.

# required properties when building the zip
# 1. exclude files (we want to put the final build in a subfolder so we need to prevent recursion into it.)
# 2. the ability to set a prefix that includes the parent directories kibana/plugin-name, for example --transform in 'tar'.
# 3. must work on both windows/linux - ie, no symbolic links.

# here's what I've tried to make the zip structure work.
# 1. the zip utility is not able to prefix the root dir with kibana/kibana-mithril inside the zip.
# 2. the tar utility can prefix the root dir and exclude files, but not create ZIP files as required by kibana.
# 3. cp alone does not work as it has no support for excluding files
#	- we get a recursion error when copying a parent folder into a subdirectory
# 4. using symbolic links, this doesn't work in gitbash (at least not without black magic.)

# here's what we are doing instead: use 'find' to skip some folders to prevent recursion error when using cp
# use cp to copy all files into a subdirectory with the required folder structure. this is slow,
# because we need to copy node_modules.
find . -maxdepth 1 -type d -not -path "./build" -not -path "./.git" -not -path "./.idea" -not -path "." -print | xargs cp -u -v -r -t $plugin_root
find . -maxdepth 1 -type f | xargs cp -u -v -t $plugin_root

# Not sure what the point of these subdirectories are, they make the build process really awkward. If kibana needs them
# to identify a plugin zip, why can't they just read the "kibana" property from the package.json? why isn't the plugin
# helper available on npm? Checking out the whole kibana repo and making sure yarn bootstrap works is too much overhead.

out="./dist/mithril-$platform-$version.zip"

# finally pack the dist zip.
cd $build
zip -x "./dist/*" -r $out "./"
cd "../"