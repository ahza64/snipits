A RESTful api for Dispatchr resources

# General Endpoints

## /api/v3/{endpoint_name}

  The `resources.json` file contains the resources for all general routes.
  
### Resource format

  ```
  {resource_name}: {
    "name": {endpoint_name},
    "options": {
      "model": {Model_name},
      "read_only": {Boolean for access specifier},
      "accepted_filters": [Array of query filters]
    }
  }
  ```
  Example
  ```json
  "tree": {
    "name": "tree",
    "options": {
      "model": "tree",
      "read_only": false,
      "accepted_filters": ["pge_pmd_num", "division", "circuit_name", "region", "project"]
    }
  }
  ```
