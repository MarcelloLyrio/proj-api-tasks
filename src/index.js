const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const users = [];
const done = false;

// Middleware
function checkExistsUserAccount(request, response, next){
    const { username } = request.headers;

    const user = users.find((user) => user.username === username);

    if(!user){
        return response.status(404).json({ error: "User not found!"});
    }
    request.user = user;
    return next();
}

app.use(cors());
app.use(express.json());

app.post("/users", (request, response) => {
    const { name, username } = request.body;
    const userAlreadyExists = users.some((user)=> user.username === username);
    
    if(userAlreadyExists){
        return response.status(400).json({error: "Customer already exists!"})
    }
    const user = {
        id : uuidv4(),
        name,
        username,
        tasks: []
    }
    users.push(user);

    return response.status(201).json(user);
});

app.use(checkExistsUserAccount);

app.post("/tasks", (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;

    const task = { 
        id: uuidv4(),
        title,
        done, 
        deadline: new Date(deadline), 
        created_at: new Date()
    }
     user.tasks.push(task);

    return response.status(201).json(user);
});

app.get("/tasks", (request, response) => {
    const { user } = request;    

    return response.status(201).json(user.tasks);
});

app.put("/tasks/:id", (request, response) => { 
    const { user } = request;
    const { title, deadline } = request.body;
    const { id } = request.params;

    const task = user.tasks.find((task) => task.id === id);
    if(!task){
        return response.status(404).json({ error: "Task not found!" });
    }
    task.title = title;
    task.deadline = new Date(deadline);


    return response.status(200).json(task);
});

app.patch("/tasks/:id/done", (request, response) => { 
    const { user } = request;
    const { id } = request.params;

    const task = user.tasks.find((task) => task.id === id);
    if(!task){
        return response.status(404).json({ error: "Task not found!" });
    }
    task.done = true;

    return response.status(200).json(task);
});

app.delete("/tasks/:id", (request, response) => { 
    const { user } = request;
    const { id } = request.params;

    const task = user.tasks.find((task) => task.id === id);
    if(!task){
        return response.status(404).json({ error: "Task not found!" });
    }
    user.tasks.splice(task, 1);

    return response.status(204);
});

app.listen(3333, () => {
    console.log("Server started in port 3333!");
});