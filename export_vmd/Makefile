TIMESTAMP=$(shell date +%Y-%m-%dT%H:%M:%S.000Z)
FILE_TIMESTAMP=$(shell date +%Y-%m-%d_%H.%M.%S)

work_packet_export:	
	mkdir vmd_export/$(FILE_TIMESTAMP)
	node extraction/index.js --outDir vmd_export/$(FILE_TIMESTAMP) --endDate $(TIMESTAMP)
	tar -zcvf vmd_wp_export_$(FILE_TIMESTAMP).tar.gz vmd_export/$(FILE_TIMESTAMP)/*.WP
	node tool/google_upload.js uploadFile vmd_wp_export_$(FILE_TIMESTAMP).tar.gz
	node mark_exported.js run vmd_export/$(FILE_TIMESTAMP) $(TIMESTAMP) 

