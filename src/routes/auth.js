const express = require('express');
const {ValidateSignUpData} = require('../utils/validation.js')
const validator = require('validator');
const bcrypt = require('bcrypt');
const Usermodel=require('../models/users.js')
const {userAuth}=require('../middlewares/auth.js');

const authRouter = express.Router();

authRouter.post('/signup',async (req,res)=>{
   
    try {
        const userobj = req.body;
       // console.log(userobj);
       const {firstname,lastname,email,password,gender,age,isMarried,skills,about}=userobj;
       ValidateSignUpData(req.body);

        const hasedpassword = await bcrypt.hash(password,10);
       // console.log(hasedpassword)
        const user = new Usermodel({firstname,lastname,email,gender,password:hasedpassword,age,isMarried,skills,about});
        const founduser = await user.save();
        const token=await founduser.getJWT();
       res.clearCookie('token', { path: '/' });
        res.cookie('token',token,{
            httpOnly: true,
            sameSite: 'None',
            secure: true,    
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
       });
        console.log('Set-Cookie header:', res.getHeader('Set-Cookie'));
        res.send(founduser);
    } catch (error) {
        console.log(error);
        res.status(401).send(error);
    }
    
})
authRouter.post('/login',async (req,res)=>{
    try {
        const {email} = req.body;
        const passwordinputbyuser=req.body.password;
        if(!validator.isEmail(email)) throw new Error('The email id is invalid');
        const founduser = await Usermodel.findOne({email});
        if(!founduser) throw new Error('Invalid credentials');
        else{
            const checkpass=await founduser.passwordcheck(passwordinputbyuser);
            if(!checkpass) throw new Error('Invalid credentials');
            else{
                const token=await founduser.getJWT();
               res.clearCookie('token', { path: '/' });
                res.cookie('token',token,{
                    httpOnly: true,
                    sameSite: 'None',
                    secure: true, 
                    path: '/',
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                res.send(founduser);
            }
        } 
    } catch (error) {
        
       res.status(400).json({ message: error.message });
    }
})

authRouter.delete('/user',userAuth,async(req,res)=>{
    const usertobedeleted=req.user;
    console.log(usertobedeleted);
    try {
        if(!usertobedeleted){
            res.status(400).send('No such user exists');
        }
        else{
            const userId=usertobedeleted._id;
           await Usermodel.findByIdAndDelete(userId);
           res.send('user deleted');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

authRouter.post('/logout',async(req,res)=>{
    try {
     res.cookie('token',null,{
        expires:new Date(Date.now())
     })
     res.send('user succesfully logged out');
    } catch (error) {
        res.status(400).send('Error logging out'+error.message);
    }

})
module.exports={authRouter}
