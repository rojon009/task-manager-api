const express = require("express");
require("./db/mongoose");


const UserRouter = require("./routers/user.router");
const TaskRouter = require("./routers/task.router");

// Express Config
const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;


// User Route
app.use(UserRouter);

// Task Route
app.use(TaskRouter);




const Task = require("./db/models/Task.model");
const User = require("./db/models/User.model");

const main = async () => {
    // const task = await Task.findById('60452f7e5019922328bc2656');
    // await task.populate('owner').execPopulate();

    const user = await User.findById('60452e35e1024835f88c069a');
    await user.populate('tasks').execPopulate();
}

// main();






// Express Server Listening
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
