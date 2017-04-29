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
    # Add commit with git original repo informations
    echo "
    module.exports.git = {
        repoSlug: '$TRAVIS_REPO_SLUG',
        branch: '$TRAVIS_BRANCH',
        commit: '$TRAVIS_COMMIT',
    };
    " > config/git.js
    git add config/git.js
    git config user.name "Travis"
    git config user.email "ung@utt.fr"
    git commit -m "Add git original repo informations"

    # Deploy
    if [[ $TRAVIS_BRANCH == 'master' ]] ; then
        git remote add dokku dokku@$DOKKU_HOST:$DOKKU_PROD
    else
        git remote add dokku dokku@$DOKKU_HOST:$DOKKU_DEV
    fi
    git push dokku HEAD:refs/heads/master -f
fi
