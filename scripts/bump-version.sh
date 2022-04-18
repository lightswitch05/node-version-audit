#!/bin/bash

set -x
set -e

LAST_VERSION=$(jq --raw-output '.version' < package.json)
MAJOR_VERSION="${LAST_VERSION%%.*}"
LAST_MINOR_VERSION="${LAST_VERSION%.*}"
LAST_MINOR_VERSION="${LAST_MINOR_VERSION##*.}"
NEW_MINOR_VERSION=$(date +"%Y%m%d")

if [[ "${LAST_MINOR_VERSION}" == "${NEW_MINOR_VERSION}" ]]; then
    PATCH_VERSION="${LAST_VERSION##*.}"
    PATCH_VERSION="$((PATCH_VERSION+1))"
else
    PATCH_VERSION="0"
fi

NEW_VERSION="${MAJOR_VERSION}.${NEW_MINOR_VERSION}.${PATCH_VERSION}-alpha"

npm version "${NEW_VERSION}"
