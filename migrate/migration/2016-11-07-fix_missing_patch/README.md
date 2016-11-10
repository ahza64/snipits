- 1) Get the missing patch log for trees
cat /var/log/dsp/api-v3__* | grep "crudops.*.\(\-tc_image\|\-image\|\-ntw_image\)" > ~/missing_patch_log.txt

- 2) Create a folder at current directory, name it `logs`

- 3) Move the missing_patch_log.txt to the folder `logs`

- 4) Run `node find_missing_patch.js` will give you a grep command like this:
cat /var/log/dsp/api-v3__* | grep "\"contentType\"*.*\"imageType\"\:\"tc_image\"*.*\"ressourceId\"\:\(\"5820e4ba6efb8e2265052570\"\|\"5820a94b5c70925b78ec33d8\"\|\"5818c2b7056ff04db89d3098\"\|\"5818c2b7056ff04db89d3099\"\|\"5818c2b7056ff04db89d309b\"\|\"5818c2b7056ff04db89d309c\"\|\"581b61c1056ff034dba400d9\"\|\"581b61c1056ff034dba400df\"\|\"5820bf67972e2807b96b9d43\"\|\"5820bf68972e2807b96b9d4f\"\)" > ~/tc_img_log.txt

- 5) Run the grep command

- 6) Move the tc_img_log.txt to the folder `logs`

- 7) `node run_tree_patch.js runPatch` to see the patches, `node run_tree_patch.js runPatch --apply` to apply the patches to the trees collection

- 8) `node run_tc_img.js runPatch` to see the patches, `node run_tc_img.js runPatch --apply` to apply the patches to the assets collection