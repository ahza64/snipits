all_tests:
 i broke it
	mocha --recursive rest_api/test/*
	mocha export_vmd/test
	mocha --recursive shared/lib/gis/*
