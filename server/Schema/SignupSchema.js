const mongoose=require("mongoose");

const UserSchema=new mongoose.Schema({
    name:String,
    email:{type:String,unqiue:true},
    date_of_birth:String,
    password:String,
    token:String,
    todo_data:new Array()
},{timestamps:true});

module.exports=UserSchema;