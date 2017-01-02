var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//var bodyParser = require('body-parser');
var PORT = process.env.PORT || 3000;
var todos=[];
var todoNextId =1;

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

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (req, res) {
	res.json(todos);
});
//GET /todos/:id
app.get('/todos/:id', function (req, res) {
	//need to change req.params.id(string) to an int
	var todoId = parseInt(req.params.id,10);
	//Iterate of todos array. Find the match.
	var matchedTodo;

	todos.forEach(function (todo) {
		if (todoId === todo.id){
			matchedTodo = todo;
		}
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	}else{
		res.status(404).send();
	}

});

//POST /todos/

app.post('/todos', function(req,res){
	var body = req.body;
	//add id field
	body.id = todoNextId++;
	body.description = 'Squat';


	//push body into array todos
	todos.push(body);
	console.log('description:' + body.description);

	res.json(body);
});


app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});