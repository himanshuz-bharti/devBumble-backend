const jwt= require('jsonwebtoken');
const UserModel = require('../models/users.js');
const userAuth = async (req,res,next)=>{
    try {
        const {token} = req.cookies;
        if(!token) throw new Error('Invalid token');
        //console.log(token);
        const decode = await jwt.verify(token,'PWD@GMAIL.COM');
        //console.log(decode);
        const {_id}=decode;
        const founduser = await UserModel.findById(_id);
        //console.log(founduser);
        if(!founduser){
            throw new Error('User not found');
        }
        else{
            req.user=founduser;
            next();
        }
    } catch (error) {
        res.status(401).send('Error in authentication:'+error.message);
    }
}

module.exports = {
    
    userAuth
}