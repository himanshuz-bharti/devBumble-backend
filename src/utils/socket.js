require('dotenv').config();
const socket = require('socket.io');
const {chatModel} = require('../models/chat.js');

const initializeSocket = (server) =>{
    const io = socket(server,{
        cors:{
            origin:process.env.CLIENT_URL,
        }
    })
    io.on('connection',  (socket)=>{
       socket.on('joinChat',({firstName,fromUserId,toUserId})=>{
           const roomId = [fromUserId,toUserId].sort().join('_');
           console.log(`${firstName} joined the room ${roomId}`);
           socket.join(roomId);
       })
       socket.on('send-message',async ({ firstName,fromUserId,toUserId,message})=>{
        try {

            const roomId = [fromUserId,toUserId].sort().join('_');
            console.log(firstName + " sent " + message);
            let Chat = await chatModel.findOne({
                participants:{$all:[fromUserId,toUserId]}
            });
            if(!Chat){
                Chat = new chatModel({participants:[fromUserId,toUserId],messages:[]});
            }
            Chat.messages.push({senderId:fromUserId,text:message});
            await Chat.save();
            socket.to(roomId).emit('recieved-message',{firstName,message});
        } catch (error) {
            console.error('An error occured-',error);
        }
       })
    })
}
module.exports = {initializeSocket};