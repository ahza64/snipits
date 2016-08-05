TIMESTAMP=$(shell date +%Y-%m-%dT%H:%M:%S.000Z)
FILE_TIMESTAMP=$(shell date +%Y-%m-%d_%H.%M.%S.000Z)

data_validation:
	node validation/index.js run

work_packet_export:	
	mkdir vmd_export/wp_$(FILE_TIMESTAMP)
	node extraction/index.js --exportName wp_$(FILE_TIMESTAMP) --startDate "last_export" --endDate $(TIMESTAMP)
	tar -zcvf vmd_wp_export_$(FILE_TIMESTAMP).tar.gz vmd_export/wp_$(FILE_TIMESTAMP)/*.WP
	node google_upload.js uploadFile vmd_wp_export_$(FILE_TIMESTAMP).tar.gz
	node mark_exported.js run vmd_export/wp_$(FILE_TIMESTAMP) $(TIMESTAMP) 

work_complete_export:	
	mkdir vmd_export/wc_$(FILE_TIMESTAMP)
	node extraction/index.js --exportName wc_$(FILE_TIMESTAMP) --startDate "last_export" --endDate $(TIMESTAMP)
	tar -zcvf vmd_wc_export_$(FILE_TIMESTAMP).tar.gz vmd_export/wc_$(FILE_TIMESTAMP)/*.WC
	node google_upload.js uploadFile vmd_wc_export_$(FILE_TIMESTAMP).tar.gz
	node mark_exported.js run vmd_export/wc_$(FILE_TIMESTAMP) $(TIMESTAMP) 
