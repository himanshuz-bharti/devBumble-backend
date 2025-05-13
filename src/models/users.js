const mongoose = require('mongoose');
const {Schema}=mongoose;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userSchema = new Schema({
    firstname:{
        type:String,
        required:true,
        minLength:4,
        maxLength:40,
    },
    lastname:{
        type:String,
        maxLength:30,
    },
    email:{
        type:String,
        required:true,
        unique:[true,"email should be unique"],
        lowercase:true,
        trim:true,
        validate(value){
            const isEmail=validator.isEmail(value);
            if(!isEmail) throw new Error('invalid email');
        }
    },
    age:{
        type:Number,
        min:18,
    },
    isMarried:{
        type:Boolean,
    },
    gender:{
        type:String,
        required:true,
        enum:{
            values:['male','female','others'],
            message:'{VALUE} is not a supported gender'
        }
    },
    password:{
        type:String,
        required:true,
        
    },
    photourl:{
        type:String,
        default:"https://i.pinimg.com/736x/51/ec/d0/51ecd0532e8d08227b15fa65a55cf522.jpg",
        validate(value){
            if(!validator.isURL(value)) throw new Error('please use a valid picture URL')
        }
    },
    about:{
        type:String,
        default:"The user is a good person",
    },
    skills:{
        type:[String],
        validate(value){
            if(value.length>5) throw new Error('Skills can have atmax 5 entries');
        }
    },
},{
    timestamps:true,
});
userSchema.methods.getJWT = async function(){
    const user = this;
    const token = await jwt.sign({_id:user._id},'PWD@GMAIL.COM',{expiresIn:'2d'});
    return token;
}

userSchema.methods.passwordcheck = async function(passwordinputbyuser){
    const user=this;
    //console.log(foundpassword);

    const isPassCorrect = await bcrypt.compare(passwordinputbyuser,user.password)
    //console.log(isPassCorrect);
    return isPassCorrect;
}
const Usermodel = mongoose.model("User",userSchema);
Usermodel.syncIndexes().catch((err) => console.error('Error syncing indexes:', err));
module.exports = Usermodel;