var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');

var db = require('./db.js');

//heroku or local
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos/?completed=false&q=work
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var objToFind = {};
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		objToFind.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		objToFind.completed = false;
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		objToFind.description = {
			$like: '%' + queryParams.q + '%'
		}
	}

	db.todo.findAll({
		where: objToFind
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

});
//GET /todos/:id
app.get('/todos/:id', function(req, res) {
	//need to change req.params.id(string) to an int
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//POST /todos/

app.post('/todos', function(req, res) {
	//filter out other properties and only keep these two
	var body = _.pick(req.body, 'description', 'completed');
	//call create on db.todo
	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});


});


//DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});
});

//PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};
	/*
		if (body.hasOwnProperty('completed') ) {
			attributes.completed = body.completed;
		}

		if (body.hasOwnProperty('description') ) {
			attributes.description = body.description;
		}
		*/
	db.todo.findById(todoId).then(function(todo) {
		//**************** findById went well
		if (todo) {
			todo.update(body).then(function(todo) {  		//this then is for todo.update
				res.json(todo.toJSON()); 					//if todo.update went well -> res.json(todo.toJSON())
			}, function(e) { 								//else if todo.update went wrong
				res.status(400).json(e); 					// --> res.status(400).json(e)
			});
		} else {							//:id doesn't exist
			res.status(404).send(); 
		}

	}, function() { //This res.status(500) will be fired if findById
		res.status(500).send(); //went wrong

	})

});



db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
})