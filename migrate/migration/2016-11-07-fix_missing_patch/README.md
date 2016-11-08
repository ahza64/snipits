
- Server grep
cat /var/log/dsp/api-v3__* | grep "crudops.*.\(\-tc_image\|\-image\|\-ntw_image\)" > ~/missing_patch_log.txt

- Download grepped file
scp prod-emu-v2:~/missing_patch_log.txt ./services/migrate/migration/2016-11-07-fix_missing_patch/logs/missing_patch_log.txt

- Run log_2_json.js to convert raw log to json format log

- Run find_missing_patch.js to get tree ids which have problems