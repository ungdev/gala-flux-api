# flux2-server

a [Sails](http://sailsjs.org) application

## Steps for dev installation

* Clone the repo
* `npm install`
* Copy `/config/local.js.dist` to `/config/local.js` and configure it.
* Try to run the server a first time : `npm start`

## Create an admin account
To create an admin account from command line, the server has to be stopped. Then run thoses two commands and follow the instructions.

```
node cli/createTeam.js # Not needed if you already fill the database with fixtures
node cli/createUser.js
```

## Fill the database
To fill the database with half-random fixtures, run the following command.

```
node cli/fixtures.js
```

## Production deployment
This app is made to have an auto deployment on master push. The app will be started as a test on travis-ci, which will then trigger the auto-deployment to a dokku server.

To push on the Dokku server, travis has to get the private ssh key of a dokku user :

```
# generate new keys
ssh-keygen -f deploy_key

# Use deploy_key.pub to create a new user on dokku that can push to this new repository
cat deploy_key.pub | ssh dokku@dokku.uttnetgroup.net dokku ssh-keys:add flux2-travis

# Login on travis and encryp key
travis login
travis encrypt-file deploy_key --add

# Clean unencrypted keys
rm deploy_key deploy_key.pub

# Add and commit encrypted deploy_key
git add deploy_key.enc
```
