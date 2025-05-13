const mongoose = require('mongoose');

const dbconnect = async ()=>{
    await mongoose.connect('mongodb+srv://Himanshu:Aman123456@cluster0.ikppogn.mongodb.net/devtinder')
}

module.exports = {
    dbconnect,
}