Internal Admin
===================

This is an admin platform mainly for user management and file ingestion management for ingestion platform. It is part of the mooncake project.

----------


Setup
-------------

Make sure you setup the service backbone and aws cli for s3 correctly.

> **Steps to setup:**
> 
> - Download the repo
> - npm install

Start the email service
-------------

> **Steps to start:**
> 
> - cd ../ (cd into the root dir of the services repo)
> - python -m backbone.broker start
> - cd email (then cd into the email dir)
> - node service.js start

Start the internal admin platform
-------------

> **Steps to start:**
> 
> - cd internal_admin (cd into internal admin app)
> - npm run dev-web (start the web server)
> - npm run dev-server (start the RESTful service)
