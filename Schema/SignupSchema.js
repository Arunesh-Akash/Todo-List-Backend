const mongoose=require("mongoose");

const UserSchema=new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    password:String,
    todo_data:new Array()
},{timestamps:true});

module.exports=UserSchema;