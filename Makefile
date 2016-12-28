all_tests:
	mocha --recursive rest_api/test/*
	mocha export_vmd/test
	mocha --recursive shared/lib/gis/*
	mocha shared/lib/test/co_iterator.js
