#TIMESTAMP=$(shell date +%Y-%m-%dT%H:%M:%S.000Z)
#FILE_TIMESTAMP=$(shell date +%Y-%m-%d_%H.%M.%S.000Z)

DATE=2016-12-10
TIMESTAMP=${DATE}T00:00:00.000Z
FILE_TIMESTAMP=${DATE}T00.00.00.000Z


data_validation:
	node validation/index.js run
data_fix:
	node validation/index.js fixes
work_packet_export:	
	mkdir vmd_export/wp_$(FILE_TIMESTAMP)
	node extraction/index.js --exportName wp_$(FILE_TIMESTAMP) --startDate "2015-01-01" --endDate $(TIMESTAMP) --skipValidate
	tar -zcvf vmd_wp_export_$(FILE_TIMESTAMP).tar.gz vmd_export/wp_$(FILE_TIMESTAMP)/*.WP
	node google_upload.js uploadFile vmd_wp_export_$(FILE_TIMESTAMP).tar.gz
	node mark_exported.js run vmd_export/wp_$(FILE_TIMESTAMP) $(TIMESTAMP) 

work_complete_export:	
	mkdir vmd_export/wc_$(FILE_TIMESTAMP)
	node extraction/index.js --exportName wc_$(FILE_TIMESTAMP) --startDate "last_export" --endDate $(TIMESTAMP) --workComplete --skipValidate
	tar -zcvf vmd_wc_export_$(FILE_TIMESTAMP).tar.gz vmd_export/wc_$(FILE_TIMESTAMP)/*.WC
	node google_upload.js uploadFile vmd_wc_export_$(FILE_TIMESTAMP).tar.gz
	node mark_exported.js run vmd_export/wc_$(FILE_TIMESTAMP) $(TIMESTAMP)


TREE_IDS=574741f49815288c382cda61

MISSING_EXPORT_DATE=${DATE}
#PACKET_NAME=MissingWPUpdate
PACKET_NAME=AdditionalWPUpdate
#vmd_wp_export_2016-08-20_MissingWPUpdate.tar.gz
create_tree_id_export:
	node extraction/index.js --exportName wp_$(MISSING_EXPORT_DATE)_${PACKET_NAME} --includeExported --skipValidate --treeIds $(TREE_IDS)
	tar -zcvf vmd_wp_export_$(MISSING_EXPORT_DATE)_${PACKET_NAME}.tar.gz vmd_export/wp_$(MISSING_EXPORT_DATE)_${PACKET_NAME}/*.WP
	node index.js uploadFile vmd_wp_export_$(MISSING_EXPORT_DATE)_${PACKET_NAME}.tar.gz
	node mark_exported.js run vmd_export/wp_$(MISSING_EXPORT_DATE)_${PACKET_NAME} $(MISSING_EXPORT_DATE) 
