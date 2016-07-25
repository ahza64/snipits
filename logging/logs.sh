#!/bin/bash
DATE=$(date +"%Y-%m-%d-%H-%M-%S")
ENV=dev
YEAR=2016
for j in {00..12}; do
  tar czfv ${j}.${YEAR}.${ENV}.tar.gz /var/log/dsp/*${YEAR}-${j}*
  if [ $? -eq 0 ]; then
    aws s3 cp ${j}.${YEAR}.${ENV}.tar.gz s3://dispatchr.logs.backup/${j}.${YEAR}.${ENV}.${DATE}.tar.gz
    rm ${j}.${YEAR}.${ENV}.tar.gz
  fi
done
rm *.${YEAR}.${ENV}.tar.gz
