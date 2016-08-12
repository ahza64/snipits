#!/bin/bash
DATE='2016-06-19'
S3BUCKET='dispatchr.mongo.min.backup'
LATEST_LIST=$(aws s3 ls s3://${S3BUCKET}/ | grep ${DATE} | grep prod_meteor)
LATEST_DATABASE=($LATEST_LIST)
echo ${LATEST_DATABASE[3]}

# empty previously downloaded databases
rm -rf ~/data/backups/*

# download the latest database
aws s3 cp s3://${S3BUCKET}/${LATEST_DATABASE[3]} ~/data/backups/${LATEST_DATABASE[3]}

# extract the database
cd ~/data/backups/ && tar xzfv ${LATEST_DATABASE[3]}

# restore database
cd ~/data/backups/data1/backup/prod_meteor_bak_min/ && mongorestore --db test_meteor --drop prod_meteor
