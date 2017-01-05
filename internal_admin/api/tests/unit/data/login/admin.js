/**
* @overview this is the sample admin for db insertion
  these credentials are used for login by tests
*/

const admin = {
  "id": 1,
  "name": "admin",
  "email": "123@test.com",
  "password": "$2a$08$J0vVDcJB8ypXPGAlsoNjk.yuivcuaadUTBdvitEYddGBYGTkWBckS",
  "status": "active",
  "role": "DA",
  "createdAt": Date.now(),
  "updatedAt": Date.now()
};
module.exports = admin;
