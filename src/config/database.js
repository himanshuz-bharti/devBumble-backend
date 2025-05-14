const mongoose = require('mongoose');

const dbconnect = async ()=>{
    await mongoose.connect(process.env.DB_URL)
}

module.exports = {
    dbconnect,
}