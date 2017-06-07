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

### /api/v4/schemas
List of all schemas

### /api/v4/{resource_name}
CRUD endpoint of resource

## Fake Data Generation

### Generate fake schemas
```
$ cd services/api_v4
$ node fake/create_schema.js create_schema {fake_schema_name} {storage_name} {config_name}
```
* `storage_name` is not a necessary parameter, but it can be used for creating a resource in the selected storage
* `config_name` is not a necessary parameter, but it can be used for filtering data based on user data. For example, if set 'test' the resource data will be filtered by companyId. Authontification is not implemented yet, but you can edit `fakeUser` in `resource_router.js` to check how filtering works.

### Create CRUD schema redirect

If you already have the REST service you are able to link it using by `crud` storage type.

```
$ cd services/api_v4
$ node fake/create_schema.js create_schema {schema_name} crud {service_url}
```

`service_url` should look like `http://localhost:3004/api/v4/origin`.

### Generate fake data for one fake schema
```
$ cd services/api_v4
$ node fake/create_records.js create_records {fake_schema_name} {number_of_records}
```

> <b>NOTE</b>: Make sure that the application is restarted after a fake schema is created.

### Copy data from one resource into another
```
$ cd services/api_v4
$ node fake/copy_records.js copy_records {source_schema_name} {target_schema_name}
```

> <b>NOTE</b>: Data will be copied with original IDs. The script will not work for some cases (if target resource has autoincremented ID).

## Querying

### Single Resource

#### Create
```
POST /api/v4/trees
```
Request Body Example:
```json
{
	"name": "...",
	"type": "...",
	"...": "..."
}
```
Response Example:
```json
{
	"envelope": {
		"request_id": "0ed6f82d-21fd-4d8e-a375-5aeefdf7adf0",
		"request_url": "/api/v4/trees",
		"host": "localhost:3004",
		"status": 200
	},
	"data": {
		"_id": "5936367c69c6dc3d661018a0",
		"name": "...",
		"type": "...",
		"...": "..."
	}
}
```
#### Read
```
GET /api/v4/trees/<id>
```
Response Example:
```json
{
	"envelope": "...",
	"data": {
		"_id": "5936367c69c6dc3d661018a0",
		"name": "...",
		"type": "...",
		"...": "..."
	}
}
```

#### Update
```
PATCH /api/v4/trees/<id>
```
Request Body Example:
```json
{
	"name": "new_name"
}
```
Response Example:
```json
{
	"envelope": "...",
	"data": {
		"_id": "5936367c69c6dc3d661018a0",
		"name": "new_name",
		"type": "...",
		"...": "..."
	}
}
```

#### Delete
```
DELETE /api/v4/trees/<id>
```
Response Example:
```json
{
	"envelope": "...",
	"data": {
		"_id": "5936367c69c6dc3d661018a0",
		"name": "new_name",
		"type": "...",
		"...": "...",
		"_deleted": true
	}
}
```
> <b>NOTE</b>: This operation is not deleting documents. It just set `true` as `_deleted` field value.

### Multiple Resources

#### List

```
GET /api/v4/trees
```
Response Example:
```json
{
	"envelope": {
		"request_id": "80640f53-f928-4455-8ae1-749f43a8d4d9",
		"request_url": "/api/v4/trees",
		"host": "localhost:3004",
		"status": 200,
		"total": 62,
		"offset": 0,
		"length": 62
	},
	"data": [ "<array of objects>" ]
}
```

#### List by IDs
```
GET /api/v4/trees/<id1>,<id2>,...
```

#### Filtered List
```
GET /api/v4/trees?name=John&city=London
```
If you want to get all records with city not equal 'London', request should look like:
```
GET /api/v4/trees?city=!London
```

#### Sorted List
In ascending order:
```
GET /api/v4/trees?sort=London
```
In descending order:
```
GET /api/v4/trees?sort=!London
```

#### Limited list
```
GET /api/v4/trees?offset=20&limit=10
```
Response Example:
```json
{
	"envelope": {
		"request_id": "80640f53-f928-4455-8ae1-749f43a8d4d9",
		"request_url": "/api/v4/trees",
		"host": "localhost:3004",
		"status": 200,
		"total": 62,
		"offset": 20,
		"length": 10
	},
	"data": [ "<array of objects>" ]
}
```

#### Aggregated List
```
GET /api/v4/trees?aggregate=type
```
Response Example:
```json
{
	"envelope": "...",
	"data": [
		{
			"type": "zone",
			"count": 2822
		}, {
			"type": "orchard",
			"count": 1071
		}, {
			"type": "tree",
			"count": 267883
		}
	]
}
```

#### Count
```
GET /api/v4/trees/count?status=left
```
Response Example:
```json
{
	"envelope": "...",
	"data": 400
}
```

### Queries

Also, it is possible to get filtered, sorted, limited or aggregated list using by `query` endpoint:
```
POST /api/v4/trees/query
```

#### Filters
Request Body Example:
```json
{
	"filters": {
		"name": "John",
		"city": "London"
	}
}
```
##### Filter by values set
Request Body Example:
```json
{
	"filters": {
		"name": "John",
		"city": ["London", "Amsterdam"]
	}
}
```

##### Filter by regex
Request Body Example:
```json
{
  "filters": {
    "status": {
      "regex": "[2-4].*"
    }
  }
}
```
> <b>NOTE</b>: `regex` filter was implemented for Elasticsearch and MongoDB storages only.

##### Filter by extent
Request Body Example:
```json
{
	"filters": {
		"location.coordinates": {
			"extent": {
				"xmin": -123,
				"ymin": 38,
				"xmax": -122,
				"ymax": 39
			}
		}
	}
}
```
> <b>NOTE</b>: `extent` filter was implemented for Elasticsearch storage only.

#### Sort
Request Body Example (ascending order):
```json
{
	"filters": {},
	"sort": "status"
}
```
Request Body Example (descending order):
```json
{
	"filters": {},
	"sort": "!status"
}
```

#### Offset / Limit
Request Body Example:
```json
{
	"filters": {},
	"sort": "status",
	"offset": 20,
	"limit": 10
}
```

#### Operators

##### not
Request Body Example:
```json
{
	"filters": {
		"name": { "not": "John" },
		"city": { "not": ["London", "Amsterdam"] }
	}
}
```

##### $or
Request Body Example:
```json
{
	"filters": {
		"type": "tree",
		"$or": [{
				"$or": [{
						"division": "Sacramento"
					}, {
						"division": "Sierra"
					}
				]
			}, {
				"division": "Stockton"
			}
		]
	}
}
```
> <b>NOTE</b>: `$or` operator was implemented for Elasticsearch storage only.

#### Aggregations

##### Aggregate data by one field
Request Body Example:
```json
{
	"filters": {},
	"aggregate": "type"
}
```
Response Example:
```json
{
	"envelope": "...",
	"data": [
		{
			"type": "zone",
			"count": 2822
		}, {
			"type": "orchard",
			"count": 1071
		}, {
			"type": "tree",
			"count": 267883
		}
	]
}
```

##### Aggregate data by many fields
Request Body Example:
```json
{
	"filters": {},
	"aggregate": ["type", "status"]
}
```
Response Example:
```json
{
	"envelope": "...",
	"data": [
		{
			"type": "tree",
			"status": "no_trim",
			"count": 5852
		}, {
			"type": "tree",
			"status": "ignore",
			"count": 5562
		}, {
			"type": "orchard",
			"status": "left",
			"count": 349
		}, "..."
	]
}
```

##### Aggregate data by geohash
Request Body Example:
```json
{
	"filters": {},
	"aggregate": {
		"type": "geohash",
		"field": "location.coordinates",
		"precision": 4,
		"min": 2000
	}
}
```
* `precision` is geohash length of aggregated data
* if resource count below `min` query will return full list

Response Example:
```json
{
	"envelope": "...",
	"data": [
		{
			"_id": "9qcy",
			"type": "cluster",
			"location": {
				"type": "Point",
				"coordinates": [-121.01676094761918, 39.131577906985086]
			},
			"count": 12984
		}, {
			"_id": "9ppz",
			"type": "cluster",
			"location": {
				"type": "Point",
				"coordinates": [-123.95964898247634, 40.75205422886693]
			},
			"count": 11210
		}, {
			"_id": "9qfp",
			"type": "cluster",
			"location": {
				"type": "Point",
				"coordinates": [-120.7745157885716, 39.255149674732884]
			},
			"count": 10313
		}, "..."
	]
}
```
> <b>NOTE</b>: `geohash` aggregation was implemented for Elasticsearch storage only.
