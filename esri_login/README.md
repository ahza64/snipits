ESRI login
=================

This esri login server is used as an optional login for Dispatchr customers that have individual user ESRI accounts

-----------------


Setup to Run a new app
-----------------

> - Log into ESRI
> - Register your application with ESRI (in the Dispatchr dashboard. "create new project" button)
> - Copy the "client ID" and "client secret" under the authentication tab in your new project in ESRI
> - Clone or download the repo
> - navigate to services/esri_login in your terminal
> - enter in your terminal: npm install
> - build your local file: "credentials.json" in the esri_login/api folder
> - add this to the file: {"clientId": "value", "clientSecret": "value"}
> - Replace the client Id value and client secret value with your registered app's relative client info
> - Set the final redirect after successful ESRI token generation (esri_login/api/server.js variable: externalRedirectUrl line 18)
> - run your server: npm run dev-server, and go to localhost:3337/oauth
