const jwt = require('jsonwebtoken');
const User = require('../db/models/User.model');

const auth = async (req,res, next) => {
    try {
        const token = await req.header('Authorization').replace('Bearer ', '');
        const decodedToken = await jwt.verify(token,'thisismynewcourse');
        const user = await User.findOne({_id: decodedToken._id, 'tokens.token': token});
        if(!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
        
    } catch (error) {
        res.status(401).send({err: 'Please Authenticate'})
    }
}

module.exports = auth;