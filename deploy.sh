#!/bin/bash

printenv

DOKKU_HOST=ung.utt.fr
DOKKU_PROD=flux2-server
DOKKU_DEV=flux2-server-dev

if [[ -n $encrypted_799a7c5f264a_key ]] ; then
    # Set up ssh key
    openssl aes-256-cbc -K $encrypted_799a7c5f264a_key -iv $encrypted_799a7c5f264a_iv -in deploy_key.enc -out deploy_key -d
    chmod 600 deploy_key
    mv deploy_key ~/.ssh/id_rsa
    eval $(ssh-agent)
    ssh-add ~/.ssh/id_rsa
    SSH config
    echo -e "Host *\n\tStrictHostKeyChecking no\n\n" > ~/.ssh/config
    Add dokku to known hosts
    ssh-keyscan -H $DOKKU_HOST >> ~/.ssh/known_hosts
    Deploy
    if [[ $TRAVIS_BRANCH == 'master' ]] ; then
        git remote add dokku dokku@$DOKKU_HOST:$DOKKU_PROD
    else
        git remote add dokku dokku@$DOKKU_HOST:$DOKKU_DEV
    fi
    git push dokku HEAD:master -f
fi

