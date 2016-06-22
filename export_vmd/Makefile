TIMESTAMP=$(shell date +%Y-%m-%dT%H:%M:%S.000Z)
FILE_TIMESTAMP=$(shell date +%Y-%m-%d_%H.%M.%S)

work_packet_export:	
	mkdir FILE_TIMESTAMP
	node extraction/index.js --outDir $(FILE_TIMESTAMP)
	tar -zcvf wp_export_$(FILE_TIMESTAMP).tar.gz $(FILE_TIMESTAMP)/*.xml
	node tool/google_upload.js uploadFile wp_export_$(FILE_TIMESTAMP).tar.gz
	node tool/qsi_dump.js markExported export/trees.csv --exported --date $(TIMESTAMP)
