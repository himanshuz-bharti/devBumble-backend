const { userAuth } = require("../middlewares/auth");
const { ConnectionRequestModel } = require("../models/connectionRequest");
const Usermodel = require('../models/users.js');
const express=require('express');

const userRouter = express.Router();

userRouter.get('/user/requests/recieved',userAuth,async(req,res)=>{
    try {
        const loggedinuser=req.user;
        //console.log(loggedinuser.firstname);
    const connectionlist = await ConnectionRequestModel.find({
        recieverID:loggedinuser._id,status:'interested'
    }).populate('senderID',['firstname','lastname','age','photourl','about']);
    console.log(connectionlist);
    res.send(connectionlist);
    } catch (error) {
        res.status(400).send('Error:'+error.message);
    }

})
userRouter.get('/user/connections',userAuth,async(req,res)=>{
    try {
        const loggedinuser=req.user;
    const connectionlist = await ConnectionRequestModel.find({
        $or:[{senderID:loggedinuser._id,status:'accepted'},{recieverID:loggedinuser._id,status:'accepted'}]
    }).populate('senderID','firstname lastname age photourl').populate('recieverID','firstname lastname age photourl');
   // console.log(connectionlist);
    const data=connectionlist.map(row=>row.senderID._id.equals(loggedinuser._id)?row.recieverID:row.senderID);
    res.send(data);
    } catch (error) {
        res.status(400).send('Error:'+error.message);
    }
})

userRouter.get('/user/feed',userAuth,async(req,res)=>{
    try {
        const loggedinuser = req.user;
        const page= req.query.page;
        let limit = req.query.limit;
        limit=limit>50?50:limit;
        const skip=(page-1)*limit;
        const objconnections = await ConnectionRequestModel.find({
            $or:[{senderID:loggedinuser._id},{recieverID:loggedinuser._id}]
        }).select('senderID recieverID')
        const hidefromfeed = new Set();
        hidefromfeed.add(loggedinuser._id.toString());
        objconnections.map((e)=>{
            hidefromfeed.add(e.senderID.toString());
            hidefromfeed.add(e.recieverID.toString());
        })
        //console.log(hidefromfeed);
        const feed=await Usermodel.find({
            _id:{$nin:Array.from(hidefromfeed)}
        }).select('firstname lastname age gender photourl').skip(skip).limit(limit);
        res.json({
            message:'here is you feed',
            feed
        })

    } catch (error) {
        res.status(400).json({message:'Error leading feed'});
    }
})


userRouter.get('/user/:id',userAuth,async (req, res) => {
  try {
    const recieverId = req.params.id;
    const user = await Usermodel.findById(recieverId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isFriend = await ConnectionRequestModel.findOne({
      $or: [
        { senderID: req.user._id, recieverID: req.params.id, status: 'accepted' },
        { senderID: req.params.id, recieverID: req.user._id, status: 'accepted' },
      ],
    });
    res.json({
      firstname: user.firstname,
      lastname: user.lastname,
      photourl: user.photourl,
      isFriend: !!isFriend, // Convert to boolean
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports=userRouter;