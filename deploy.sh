#!/bin/bash
DOKKU_HOST=ung.utt.fr
DOKKU_PROD=api.flux.uttnetgroup.fr
DOKKU_DEV=api.flux-dev.uttnetgroup.fr

if [[ -n $SSH_DEPLOY_KEY ]] ; then
    # Set up ssh key
    mkdir -p ~/.ssh
    eval $(ssh-agent -s)
    ssh-add - <<< "${SSH_DEPLOY_KEY}"
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
