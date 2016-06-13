# PDF Generation Service
This server on node js and express js will receive html and convert it to pdf. A user will send a post request with the html and will receive an id which the user can retrieve it by the given ID.

##### Request to start PDF generation
**Request Method**: POST
**Request URI**: http://localhost:8888/pdf
**Content Type**: application/json
**RAW Body**: 
```javascript
{“data”: “<h1>Data</h1>”}
```
**Success Response**:
**Status Code**: 201
**Response**
```javascript
{“message”: “1234566665”}
//A Unique String ID
```
##### Request to get PDF
**Request Method**: GET
**Request URI**: http://localhost:8888/pdf/:id
**Content Type**: application/json
**Success Response**:
**Status Code**: 200
**Response**
```javascript
{“message”: “http://localhost:8888/pdf/1234566.pdf”}
```
**Other Responses**:
**Status Code**: 202
**Response**
```javascript
{“message”: “Pdf file creation in process”}
```
**Status Code**: 404
**Response**
```javascript
{“message”: “Pdf not found”}
```
**Status Code**: 422
**Response**
```javascript
{“message”: “Some error message regarding pdf creation error”}
```
