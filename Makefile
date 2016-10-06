all_tests:
	mocha --recursive rest_api/test/*
	mocha export_vmd/test
