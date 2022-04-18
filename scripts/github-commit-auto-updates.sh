#!/bin/bash
set -eu

cat <<- EOF > "${HOME}/.netrc"
        machine github.com
        login $GITHUB_ACTOR
        password $GITHUB_TOKEN
        machine api.github.com
        login $GITHUB_ACTOR
        password $GITHUB_TOKEN
EOF
chmod 600 "${HOME}/.netrc"
git config --global user.email "daniel@developerdan.com"
git config --global user.name "Auto Updates"

COMMIT_MESSAGE="Automatic github actions updates."
LINES_ADDED=$(git diff --numstat docs/rules-v1.json | sed 's/^\([0-9]*\)\(.*\)/\1/g')
if [ "$LINES_ADDED" -gt "1" ]; then
   COMMIT_MESSAGE="${COMMIT_MESSAGE} Changes found @lightswitch05"
fi

git add ./docs/rules-v1.json ./package.json ./package-lock.json
git commit -m "${COMMIT_MESSAGE}"

NEW_TAG=$(jq --raw-output '.version' < package.json)
git push origin : "${NEW_TAG}"
