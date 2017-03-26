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
