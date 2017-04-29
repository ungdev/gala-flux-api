#!/bin/bash
DOKKU_HOST=ung.utt.fr
DOKKU_PROD=api.flux.uttnetgroup.fr
DOKKU_DEV=api.flux-dev.uttnetgroup.fr

if [[ -n $encrypted_799a7c5f264a_key ]] ; then
    # Set up ssh key
    openssl aes-256-cbc -K $encrypted_799a7c5f264a_key -iv $encrypted_799a7c5f264a_iv -in deploy_key.enc -out deploy_key -d
    chmod 600 deploy_key
    mv deploy_key ~/.ssh/id_rsa
    eval $(ssh-agent)
    ssh-add ~/.ssh/id_rsa
    # SSH config
    echo -e "Host *\n\tStrictHostKeyChecking no\n\n" > ~/.ssh/config
    # Add dokku to known hosts
    ssh-keyscan -H $DOKKU_HOST >> ~/.ssh/known_hosts
    # Deploy
    if [[ $TRAVIS_BRANCH == 'master' ]] ; then
        DOKKU_PROJECT="$DOKKU_PROD"
    else
        DOKKU_PROJECT="$DOKKU_DEV"
    fi
    git remote add dokku dokku@$DOKKU_HOST:$DOKKU_PROJECT
    git push dokku HEAD:refs/heads/master -f
    ssh -t dokku@$DOKKU_HOST config:set --no-restart $DOKKU_PROJECT TRAVIS_REPO_SLUG="$TRAVIS_REPO_SLUG" TRAVIS_BRANCH="$TRAVIS_BRANCH" TRAVIS_COMMIT="$TRAVIS_COMMIT"
fi
