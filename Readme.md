var author = {
	name: "Oleksandr Knyga",
	description: "Rational light ORM"
};

var mAuthor = new Model(author);

var name = mAuthor.get('name');

mAuthor.set('name', 'Oleksandr The Knyga');
mAuthor.set({
	name: 'Oleksandr Knyga'
});

mAuthor.before(function(type) {
	//type is create, update or remove
	console.log('before', type);
});

mAuthor.after(function(type) {
	//type is create, update or remove
	console.log('after', type);
});

//Insert, based on object
mAuthor.create();

//Update query with `id` as primary key
mAuthor.update();

//If primary is not `id`
mAuthor.update({
	pk: ['id_author']
});

//And we want to specify fields to update
mAuthor.update({
	pk: ['id_author'],
	fields: ['name']
});

//Also, you can set specific value to pk
mAuthor.update({
	pkValue: {
		id_author: 5
	},
	fields: ['name']
});

//Delete query with id` as primary key
mAuthor.remove();

//If primary is not `id`
mAuthor.remove({
	pk: ['id_author']
});

//Also, you can set specific value to pk
mAuthor.remove({
	pkValue: {
		id_author: 5
	}
});