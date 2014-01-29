var mysql = require('mysql'),
	lightOrm = require('light-orm');

lightOrm.driver = mysql.createConnection(require('./connection.json'));
lightOrm.driver.connect();

var author = {
	name: "Oleksandr Knyga",
	description: "Rational light ORM"
};

var AuthorCollection = new lightOrm.Collection('author');

//Select by object
AuthorCollection.findOne({
	id: 1
}, function(err, model) {
	//Get all attributes
	console.log(model.getAll());
	//{ id: 1, name: 'James Bond', description: 'Agent 007' }
});

//Select by query
AuthorCollection.findOne("SELECT * FROM `author` WHERE id = 1", function(err, model) {
	console.log(model.getAll());
	//{ id: 1, name: 'James Bond', description: 'Agent 007' }
});


//Get scalar from select
AuthorCollection.findOne("SELECT COUNT(*) as `count` FROM `author` WHERE name = '" + author.name + "'", function(err, data) {
	var count = data.get('count');

	if (count < 1) {
		//Create model
		var knygaModel = AuthorCollection.createModel(author);
		knygaModel.create(function(err) {
			console.log(err);
		});
	}
});

AuthorCollection.findOne({
	name: author.name
}, function(err, model) {
	if (!model) {
		return;
	}

	console.log(model.getAll());
	//{ id: 31, name: 'Oleksandr Knyga', description: 'Rational light ORM' }

	//Set data
	model.set('description', author.description + ' awesome');

	//Update
	model.update(function(err, model) {

		if (model) {
			console.log(err, model.get('description'));
			//Rational light ORM awesome
		} else {
			console.log(err);
		}

	});

	//Update, manual pk
	model.update({
		pkValue: {
			id: 31
		}
	}, function(err, model) {

		if (model) {
			console.log(err, model.get('description'));
			//Rational light ORM awesome
		} else {
			console.log(err);
		}

	});

	//Update, manual pk value
	model.update({
		pk: ['id']
	}, function(err, model) {

		if (model) {
			console.log(err, model.get('description'));
			//Rational light ORM awesome
		} else {
			console.log(err);
		}

	});


	return;
	//Delete
	model.remove(function(err) {
		console.log(err);
	});

	//Delete, manual pk
	model.remove({
		pk: ['id']
	}, function(err) {
		console.log(err);
	});

	//Delete, manual pk value
	model.remove({
		pkValue: {
			id: 31
		}
	}, function(err) {
		console.log(err);
	});
});

AuthorCollection.find({
	name: "me"
}, function(err, authors) {

});

AuthorCollection.findAll(function(err, authors) {
	
});