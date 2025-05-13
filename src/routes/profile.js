const express = require('express');
const {userAuth}=require('../middlewares/auth.js');
const profileRouter = express.Router();
const Usermodel=require('../models/users.js');
const {ValidateEditedData}=require('../utils/validation.js');
const bcrypt = require('bcrypt');
const validator=require('validator');
profileRouter.get('/profile/view',userAuth,async (req,res)=>{
    try {
        const {user}=req;
        res.send(user);
        
    } catch (error) {
        res.status(400).send('Error verifying token:'+error.message);
    }
    
})

profileRouter.patch('/profile/edit',userAuth,async (req,res)=>{
    try {
    //     const {_id}=req.user;
    //     const {firstname,lastname,age,isMarried,gender,photourl,about,skills}=req.body;
    //    ValidateEditedData(req.body);
    //     if(req.body.email || req.body.password) throw new Error('Cannot edit email or password');
    //     await Usermodel.findByIdAndUpdate(_id,req.body);
    const loggedinuser = req.user;
    ValidateEditedData(req.body);
    Object.keys(req.body).forEach((key)=>loggedinuser[key]=req.body[key]);
    const user = await loggedinuser.save();
    res.status(200).send(user);
    } catch (error) {
    res.status(400).send('Profile updation failed:'+error.message);
    }
})

profileRouter.patch('/profile/password',userAuth,async (req,res)=>{
    try {
        const {currentpassword,newpassword}=req.body;
    const loggedinuser = req.user;
    const ispasswordcorrect = await bcrypt.compare(currentpassword,loggedinuser.password);
    if(!ispasswordcorrect) throw new Error('Entered password is incorrect');
    if(!validator.isStrongPassword(newpassword)) throw new Error('Entered password is not strong enough');
    const hasdhedpassword=await bcrypt.hash(newpassword,10);
    loggedinuser.password=hasdhedpassword;
    await loggedinuser.save();
    res.send('password update sucessfull');
    } catch (error) {
        res.status(400).send('Failed to update the password:'+error.message);
    }
    
})

module.exports ={profileRouter};