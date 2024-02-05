const mongoose=require('mongoose');

const todoSchema=new mongoose.Schema({
    title:String,
    description:String,
    status:{
        type:String,
        enum:['todo','in_progress','done'],
        default:'todo'
    }
},{timestamps:true});


module.exports=todoSchema;