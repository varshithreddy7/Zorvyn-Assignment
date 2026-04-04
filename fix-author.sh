#!/bin/bash

git filter-branch --force --env-filter '
export GIT_COMMITTER_NAME="Varshith Reddy Aileni"
export GIT_COMMITTER_EMAIL="varshithreddy355@gmail.com"
export GIT_AUTHOR_NAME="Varshith Reddy Aileni"
export GIT_AUTHOR_EMAIL="varshithreddy355@gmail.com"
' --tag-name-filter cat -- --branches --tags
