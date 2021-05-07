const { useForkRef } = require('@material-ui/core');
const express = require('express');
const router = new express.Router();

const User = require("../db/models/User.model");
const auth = require('../middlewares/auth');    


router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user,token});
    } catch (error) {
        res.send(error);
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password );
        if(!user) {
            res.send("NOT FOUND");
        }

        const token = await user.generateAuthToken();

        res.status(200).send({user,token});
    } catch (error) {
        res.send(error);
    }
})

router.post('/users/logout',auth, async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
            const user = await req.user.save();
            res.send(user);
        } catch (error) {
            res.status(500).send('Did not go well')
        }
})

router.post('/users/logoutAll',auth, async (req, res) => {
        try {
            req.user.tokens = [];
            const user = await req.user.save();
            res.send(user);
        } catch (error) {
            res.status(500).send('Did not go well');
        }
})

router.get("/users/me", auth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (error) {
        res.send(error);
    }
});

router.patch("/users/me",auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(404).send("This is invalid update operation");

    try {
        const user = req.user;

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        if (!user) return res.status(404).send("This User is not found");
        res.send(user);
    } catch (error) {
        res.send(error);
    }
});

router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.send(error);
    }
});

router.delete("/users", async (req, res) => {
    try {
       await User.deleteMany({});
        res.send('done')
    } catch (error) {
        res.send(error);
    }
});

router.get("/users", async ( req, res ) => {
    try {
        const users = await User.find({});
        if(!users) return res.send('NO USER IS CREATED');
        res.send(users)
    } catch (error) {
        res.send(error)
    }
})

module.exports = router;


