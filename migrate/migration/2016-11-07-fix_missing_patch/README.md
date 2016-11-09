- Get the missing patch
cat /var/log/dsp/api-v3__* | grep "crudops.*.\(\-tc_image\|\-image\|\-ntw_image\)" > ~/missing_patch_log.txt

- Get the missing img based on local id
cat /var/log/dsp/api-v3__* | grep "\"contentType\"*.*\"imageType\"\:\"tc_image\"*.*\"ressourceId\"\:\(\"5820e4ba6efb8e2265052570\"\|\"5820a94b5c70925b78ec33d8\"\|\"5818c2b7056ff04db89d3098\"\|\"5818c2b7056ff04db89d3099\"\|\"5818c2b7056ff04db89d309b\"\|\"5818c2b7056ff04db89d309c\"\|\"581b61c1056ff034dba400d9\"\|\"581b61c1056ff034dba400df\"\|\"5820bf67972e2807b96b9d43\"\|\"5820bf68972e2807b96b9d4f\"\)" > ~/tc_img_log.txt

- Download grepped file
scp prod-emu-v2:~/missing_patch_log.txt ./services/migrate/migration/2016-11-07-fix_missing_patch/logs/missing_patch_log.txt
scp prod-emu-v2:~/tc_img_log.txt ./services/migrate/migration/2016-11-07-fix_missing_patch/logs/tc_img_log.txt

- Run log2json_*.js to convert raw log to json format log

- Run find_missing_patch.js to get tree ids which have problems and the grep command for those trees

- Run patch_trees.js to patch trees