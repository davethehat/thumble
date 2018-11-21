#!/usr/bin/env bash

PACKAGE_NAME=$1

mkdir -p ./build
rm -rf ./build/*

cp index.js package.json build
cd build
npm install --only=prod
zip -r ${PACKAGE_NAME}.zip index.js node_modules