# Cleanup

## Collections

### Run 

`node collection_cleanup.js cleanup --model {collection_name}`

Running this command will delete fields from the specified collection, based on the configuration specified in the `config.json` file.

Eg:

```javascript
{
  "cufs": {
    "query": {},
    "delete_fields": {
      "assigned_workorders": 1,
      "division_data": 1,
      "scheduled_data": 1
    }
  }
}
```
