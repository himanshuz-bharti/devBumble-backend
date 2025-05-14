const express = require('express')
const {dbconnect} = require('./config/database.js');
const Usermodel = require('./models/users.js');
const {ValidateSignUpData} = require('./utils/validation.js')
const {userAuth}=require('./middlewares/auth.js');
const validator = require('validator');
const bcrypt = require('bcrypt');
const cookie_parser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
app.use(cors({
    origin:'http://localhost:5173',
    methods:['GET','POST','PATCH','DELETE'],
    allowedHeaders:['Content-Type','Authorization'],
    credentials:true
}));
const {authRouter}=require('./routes/auth.js');
const {profileRouter}=require('./routes/profile.js');
const {requestRouter}=require('./routes/request.js');
const userRouter = require('./routes/user.js');

app.use(express.json()); 
app.use(cookie_parser());

app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',requestRouter);
app.use('/',userRouter);
app.get('/user',async(req,res)=>{
    try {
        const email = req.body.email;
        const user=await Usermodel.find({email:email});
        if(user.length==0) throw new Error('User Does not exist');
        res.send(user);
    } catch (error) {
        res.status(404).send(error.message);
    }
})

app.get('/feed',async (req,res)=>{
    const user = await Usermodel.find({});
    res.send(user);
})



app.patch('/user',async(req,res)=>{
    const userId=req.body.userId;
    const data=req.body;
    const Allowed_fields=['gender','age','lastname','about'];
    const filterfunction=function({gender,age,lastname,about,photourl,isMarried}){
        return {gender,age,lastname,about,photourl,isMarried};
    }
    const new_data=filterfunction(data);
    
    try {
        if(!userId){
            res.status(400).send('No such user exists');
        }
        else{
            const doc=await Usermodel.findByIdAndUpdate(userId,new_data,{runValidators:true});
           // console.log(doc);
            res.send('user updation successfull');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})
dbconnect().then(()=>{
    console.log('Database connected ');
    app.listen(3000,()=>{
        console.log('Server listening');
    })
 }).catch((err)=>{
    console.error('Database not connected',err.message)
 })
