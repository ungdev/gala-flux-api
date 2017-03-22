# flux2-server

a [Sails](http://sailsjs.org) application

## Steps for dev installation

* Clone the repo
* `npm install`
* Copy `/config/local.js.dist` to `/config/local.js` and configure it.
* Try to run the server a first time : `npm start`
* If everything work you can halt it with `Ctrl+C`

### Create an admin account
If the user collection is empty in the database, the first user that will try to authenticate
via OAuth (EtuUTT), will have an adminitrator account.
