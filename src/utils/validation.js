const validator  = require('validator');

const ValidateSignUpData = (val) =>{
    const {firstname,lastname,email,password}=val;
    if(!firstname || !lastname) throw new Error('Name is invalid');
    else if(!validator.isStrongPassword(password)) throw new Error('Enter a strong password');
}

const ValidateEditedData = (val) =>{
    if(val.email || val.password) throw new Error('Cannot edit Email or password');
    const {firstname,lastname,age,skills}=val;
    if((firstname && firstname.length>100) || (lastname && lastname.length>100)) throw new Error('Invalid name');
    if(age<18) throw new Error('Age should atleast be 18');
    if(skills && skills.length>5) throw new Error('Max 5 skills can be listed');
}
module.exports = {ValidateSignUpData,ValidateEditedData};