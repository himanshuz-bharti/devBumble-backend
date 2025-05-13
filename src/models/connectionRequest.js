const mongoose = require('mongoose')
const {Schema}=mongoose;
const UserModel=require('../models/users.js');
const connectionRequestSchema = new Schema({
    senderID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    recieverID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    status:{
        type:String,
        required:true,
        enum:{
            values:['interested','ignored','accepted','rejected'],
            message:'{VALUE} is not accepted'
        }
    }
},{
    timestamps:true,
})

connectionRequestSchema.index({senderID:1,recieverID:1}) //compound index to make queries like connectionRequest.findOne({senderID,recieverID}) fast
connectionRequestSchema.pre('save',function(next){
    if(this.senderID.equals(this.recieverID)){
        throw new Error('Cannot send the request to yourself');
    }
    next();
})
const ConnectionRequestModel = new mongoose.model('connectionRequest',connectionRequestSchema);

module.exports={ConnectionRequestModel};