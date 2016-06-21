#!/bin/sh
export AWS_CONFIG_FILE="/root/.aws/config"
export AWS_ACCESS_KEY_ID=AKIAJGFWA4HGKCZ7YRWQ
export AWS_SECRET_ACCESS_KEY=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
export AWS_DEFAULT_REGION=us-west-2
now=$(date +%F_%R)
echo ${now}

/usr/bin/mongodump --host prod2.dispatchr.co --port 27017 --db prod_meteor --excludeCollection=treehistories --excludeCollection=tile_caches  --out /data1/backup/prod_meteor_bak_min && /bin/tar -czf /data1/backup/prod_meteor_bak_"$now".min.tar.gz /data1/backup/prod_meteor_bak_min && /bin/rm -rf /data1/backup/prod_meteor_bak_min && /usr/local/bin/aws s3 cp /data1/backup/prod_meteor_bak_*.min.tar.gz s3://dispatchr.mongo.min.backup/prod_meteor_bak_"$now".min.tar.gz && /bin/rm -rf /data1/backup/prod_meteor_bak_*.min.tar.gz