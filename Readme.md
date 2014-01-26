##Light-orm
Light-orm - super simple ORM node.js wrapper for relational databases. It do not depends on any specific driver, so you can connect to mysql, ms server and so on...

Your db connector (or wrapper) just should implement the interface:
```
interface DriverInterface {
    query(query: string, handler: (err, rows, fields) => void);
}
```
This interface came from node-mysql driver, as most popular option, that lets you avoid writting your wrappers to connectors.

Light-orm gives you freedom in choising your own driver. You should not any more make meet half-way between high driver performance with native realization and ORM wrapper.

###Development
Light-orm is written on typescript. Look for the sources here: lib/typescript and lib/compiler. You may find there comments in jsdoc style.

###Examples
Example connection (mysql):
```javascript
var mysql = require('mysql'),
	lightOrm = require('light-orm');

var connection = mysql.createConnection(require('./connection.json'));
connection.connect();
```

Create collection for table name `author`:
```javascript
var AuthorCollection = new lightOrm.Collection(connection, 'author');
```

Find one model:
```javascript
AuthorCollection.findOne({
	id: 1
}, function(err, model) {
	console.log(model.getAll());
	//{ id: 1, name: 'James Bond', description: 'Agent 007' }
});
```

Find one model by sql:
```javascript
AuthorCollection.findOne("SELECT * FROM `author` WHERE id = 1", function(err, model) {
	console.log(model.getAll());
	//{ id: 1, name: 'James Bond', description: 'Agent 007' }
});
```

Find models:
```javascript
CarCollection.find({
	category_id: 5
}, function(err, models) {});
```

Find models by sql:
```javascript
CarCollection.find({
	category_id: 5
}, function(err, models) {});
```

Get all attributes:
```javascript
model.getAll();
```

Get one attribute:
```javascript
model.get('name');
```

Set attribute:
```javascript
model.set('name', 'Oleksandr Knyga');
```

Set attributes:
```javascript
model.set({
	name: 'Oleksandr Knyga'
});
```

Get custom row by sql:
```javascript
AuthorCollection.findOne("SELECT COUNT(*) as `count` FROM `author` WHERE name = '" + author.name + "'", function(err, data) {
	var count = data.get('count');
});
```

Update:
```javascript
model.update(function(err, model) {});
```

Update, with custom where block:
```javascript
model.update({
	pkValue: {
		id: 31
	}
}, function(err, model) {});
```

Update, manual pk field name:
```javascript
model.update({
		pk: ['id']
}, function(err, model) {});
```

Delete:
```javascript
model.remove(function(err, model) {});
```

Delete, with custom where block:
```javascript
model.remove({
	pkValue: {
		id: 31
	}
}, function(err, model) {});
```

Delete, manual pk field name:
```javascript
model.remove({
		pk: ['id']
}, function(err, model) {});
```

###Licence
Copyright 2014 Oleksandr Knyga <oleksandrknyga@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.