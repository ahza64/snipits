TIMESTAMP=$(shell date +%Y-%m-%dT%H:%M:%S.000Z)
FILE_TIMESTAMP=$(shell date +%Y-%m-%d_%H.%M.%S.000Z)

work_packet_export:	
	mkdir vmd_export/$(FILE_TIMESTAMP)
	node extraction/index.js --exportName $(FILE_TIMESTAMP) --startDate "last_export" --endDate $(TIMESTAMP)
	tar -zcvf vmd_wp_export_$(FILE_TIMESTAMP).tar.gz vmd_export/$(FILE_TIMESTAMP)/*.WP
	node google_upload.js uploadFile vmd_wp_export_$(FILE_TIMESTAMP).tar.gz
	node mark_exported.js run vmd_export/$(FILE_TIMESTAMP) $(TIMESTAMP) 

