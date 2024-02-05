const express=require('express');
const app=express();
const mongoose=require('mongoose');
const morgan=require("morgan")
const cors=require('cors');
const signupRouter=require("./Router/SignupRouter");
const loginRouter=require("./Router/LoginRouter");
const todoRouter=require("./Router/TodoRouter");
const userRouter=require("./Router/UserRouter");

mongoose.connect("mongodb://localhost:27017/todo-DB");

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/user/signup",signupRouter);
app.use("/user/login",loginRouter);
app.use("/user/todo",todoRouter);
app.use("/user",userRouter);


const APPLICATION_PORT=4500;
app.listen(APPLICATION_PORT,()=>{
    console.log("Server is listening on port 4500");
});