MONGO_URL:="mongodb://localhost:27017/dev_local"
CONFIG_URL:="http://config.dispatchr.co/api/v2/user"
BASE_URL:="localhost:3000/api/v3"

run_tests:
	for file in ./*.js; do \
		mocha $$file; \
	done
	for file in ./e2e/*.js; do \
		mocha $$file; \
	done
