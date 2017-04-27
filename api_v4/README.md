# API V4
CRUD access for PostgreSQL, MongoDB and Elasticsearch storages

## Installation
* Create configuration file:
```
$ cd services/shared
$ mkdir conf.d
$ cp config/config_template.json conf.d/config.json
```
* Make the necessary changes in `services/shared/conf.d/config.json`
* Install shared packages:
```
$ cd services/shared
$ npm run install
```
* Install project packages:
```
$ cd services/api_v4
$ npm run install
```

## Configure Storages
Storages configuration is located in the `schema` block of configuration file:
* `storages` - named list of storages
* `defaultStorage` - name of the storage that contains the schemas list

Example:
```json
{
	"...": "...",
	"schema": {
		"defaultStorage": "mongo",
		"storages": {
			"mongo": {
				"type": "mongo",
				"name": "schema",
				"mongo_db_host": "localhost",
				"mongo_db_name": "minishiva",
				"mongo_db_port": 27017
			},
			"postgres": {
				"type": "postgres",
				"db_host": "localhost",
				"db_port": 5432,
				"db_name": "schema",
				"db_user": "postgres",
				"db_pass": "password"
			},
			"elastic": {
				"type": "elasticsearch",
				"db_host": "localhost",
				"db_port": 9200,
				"db_name": "dev",
				"db_user": "elastic",
				"db_pass": "elastic"
			}
		}
	},
	"...": "..."
}
```


## Start the API V4 Service
```
$ cd services/api_v4
$ node app.js
```
## General Endpoints

### /api/v3/schemas
List of all schemas

### /api/v3/{resource_name}
CRUD endpoint of resource

## Fake Data Generation

### Generate fake schemas
```
$ cd services/api_v4
$ node fake/create_schema.js create_schema {fake_schema_name} {storage_name} {config_name}
```
* `storage_name` is not a necessary parameter, but it can be used for creating a resource in the selected storage
* `config_name` is not a necessary parameter, but it can be used for filtering data based on user data. For example, if set 'test' the resource data will be filtered by companyId. Authontification is not implemented yet, but you can edit `fakeUser` in `resource_router.js` to check how filtering works.

### Generate fake data for one fake schema
```
$ cd services/api_v4
$ node fake/create_records.js create_records {fake_schema_name} {number_of_records}
```

> <b>NOTE</b>: Make sure that the application is restarted after a fake schema is created.
