# flux2-server

Sever side of the communication system created for the Gala UTT

There is two documentations available for this project

* [User documentation](https://github.com/ungdev/flux2-server/wiki/User-documentation): Use the API from a client
* [Dev documentation](https://github.com/ungdev/flux2-server/wiki/Dev-documentation): Code on this project

## Steps for dev installation

* Install [Yarn](https://yarnpkg.com/lang/en/docs/install/) and NodeJS 8.9
* Clone the repo
* `yarn install`
* Install a MariaDB server and create an empty database for Flux
* If needed, copy `config/database.js` into `config/database.local.js` and update it
* You can now run the server with : `yarn dev`

### Fill the database
To reset the database and fill it with half-random fixtures, run the following command.

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

On the dokku app, you can configure EtuUTT api configuration and the JWT secret

```
dokku config:set api.flux.uttnetgroup.fr DOKKU_APP_NAME=api.flux.uttnetgroup.fr ETUUTT_ID= ETUUTT_SECRET= JWT_SECRET=
dokku config:set api.flux-dev.uttnetgroup.fr DOKKU_APP_NAME=api.flux-dev.uttnetgroup.fr ETUUTT_ID= ETUUTT_SECRET= JWT_SECRET=
```

And configure MySQL credentials
dokku config:set api.flux.uttnetgroup.fr FLUX_DB_HOST= FLUX_DB_NAME=flux FLUX_DB_USER=flux FLUX_DB_PASSWORD=
dokku config:set api.flux-dev.uttnetgroup.fr FLUX_DB_HOST= FLUX_DB_NAME=flux_dev FLUX_DB_USER=flux_dev FLUX_DB_PASSWORD=

## Create an admin account
To start to use the application, you need at least one admin user.
To create an admin account from command line. Then run thoses two commands and follow the instructions.

```
node cli/createTeam.js # Not needed if you already fill the database with fixtures
node cli/createUser.js
```

## Firebase setup

You have to generate a config file. [Go here and read the instructions](https://firebase.google.com/docs/admin/setup).
