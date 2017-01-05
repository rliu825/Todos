var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
//heroku or local
var PORT = process.env.PORT || 3000;
var todos=[];
var todoNextId =1;

/*
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
}, {
	id: 2,
	description: 'Go to gym',
	completed: false
}, {
	id: 3,
	description: 'Go to market',
	completed: true
}]; 
*/
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (req, res) {
	var queryParams =req.query;
	var filteredTodos = todos;

	//if has property && completed ==='true'
	if (queryParams.hasOwnProperty('completed') && queryParams.completed ==='true'){
		filteredTodos = _.where(filteredTodos, {completed: true});
	}else if (queryParams.hasOwnProperty('completed') && queryParams.completed ==='false'){
		filteredTodos = _.where(filteredTodos, {completed: false});
	}


	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function (todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	//filtertodos = .where(filtertodos,?)
	//else if has prop && completed is 'false' 
	res.json(filteredTodos);
	
	res.json(todos);
});
//GET /todos/:id
app.get('/todos/:id', function (req, res) {
	//need to change req.params.id(string) to an int
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	//Iterate of todos array. Find the match.
	// var matchedTodo;

	// todos.forEach(function (todo) {
	// 	if (todoId === todo.id){
	// 		matchedTodo = todo;
	// 	}
	// });

	if (matchedTodo) {
		res.json(matchedTodo);
	}else{
		res.status(404).send();
	}

});

//POST /todos/

app.post('/todos', function(req,res){
	//filter out other properties and only keep these two
	var body = _.pick(req.body,'description','completed');
	
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}


	//set body.description to be trimmed value (trim returns new string instead of editing current string)
	body.description = body.description.trim().replace(/\s+/g, " ");;
	body.id = todoNextId++;

	todos.push(body);

	res.json(body);
});


//DELETE /todos/:id
app.delete('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	if (!matchedTodo){
		res.status(404).json({"error": "no todo found with that id"});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}

})

//PUT /todos/:id
app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};
	
	if (!matchedTodo){
		res.status(404).json({"error": "no todo found with that id"});
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
			return res.status(400).send();
	} 

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	}else if (body.hasOwnProperty('description')){
			return res.status(400).send();
	}

	//Actual update - return updated matchedTodo
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});




app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});