const express = require('express');
const {userAuth} = require('../middlewares/auth.js');
const { ConnectionRequestModel } = require('../models/connectionRequest.js');
const Usermodel = require('../models/users.js');

const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:recieverID',userAuth,async (req,res)=>{
    try {
    const senderID=req.user._id;
    const recieverID=req.params.recieverID;
    const status=req.params.status; 
    const allowedstatus=['interested','ignored'];
    if(!allowedstatus.includes(status)) throw new Error('Incorrect status type'+status);
    const recieverobj = await Usermodel.findById(recieverID);
    if(!recieverobj) throw new Error('Reciever not present')
  const isRequestSent=await ConnectionRequestModel.findOne({
    $or:[
        {senderID,recieverID},{senderID:recieverID,recieverID:senderID}
    ]
  })
    if(isRequestSent) throw new Error('Request already sent');

    const connectionRequest= new ConnectionRequestModel({senderID,recieverID,status});
    const data=await connectionRequest.save();
    res.send(`${req.user.firstname} is ${status} in ${recieverobj.firstname}`);
}
    catch (error) {
        res.status(401).send('Error during sending the request:'+error.message);
    }
});

requestRouter.post('/request/recieved/:status/:requestID',userAuth,async (req,res)=>{
    try {
        const senderID=req.params.requestID;
    const recieverID=req.user._id;
    const status=req.params.status;
    const requestdoc = await ConnectionRequestModel.findOne({senderID,recieverID,status:'interested'});
    if(!requestdoc) throw new Error('No such request recieved');
    const allowedstatus=['accepted','rejected'];
    if(!allowedstatus.includes(status)) throw new Error('You cannot do this action, only accepted and rejected are allowed');
    requestdoc.status=status;
    await requestdoc.save();
    res.send('request:'+status);
    } catch (error) {
        res.status(400).send('Some error occured:'+error.message);
    }
})


module.exports={requestRouter};