MONGO_URL:="mongodb://localhost:27017/dev_local"
CONFIG_URL:="http://config.dispatchr.co/api/v2/user"
ALL_JS:="/Users/hasnain/Dispatchr/services/rest_api/tests"

run_tests:
	for file in ./*.js; do \
		mocha $$file; \
	done
