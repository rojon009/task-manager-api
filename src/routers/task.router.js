const express = require('express');
const router = new express.Router();
const auth = require('../middlewares/auth');
const Task = require("../db/models/Task.model");

// Creating new task
router.post("/tasks", auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    
    try {
        await task.save();
        res.status(200).send("Task is created successfully");
    } catch (error) {
        res.send(error);
    }
});

// Get all user Created Tasks
router.get("/tasks", auth, async (req, res) => {

    const match = {};
    const sort = {};

    if(req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 ;
    }
    
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        const tasks = req.user.tasks;
    
        if (tasks.length < 1) return res.status(404).send("No Task is available");
        res.status(200).send(tasks);
    } catch (error) {
        res.send(error);
    }
});


// Get individual task
router.get("/tasks/:id", auth, async (req, res) => {
    try {

        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        
        if (!task) return res.status(404).send("This Task is not found");
        res.send(task);
    } catch (error) {
        res.send(error);
    }
});


// Update Task
router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(404).send("This is invalid update operation")

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        
        if (!task) return res.status(404).send("This Task is not found");

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task);
    } catch (error) {
        res.send(error)
    }
});


// Delete Task
router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if (!task) return res.status(404).send("This Task is not found");
        res.send(task);
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;