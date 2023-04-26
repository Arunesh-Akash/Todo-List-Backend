const express = require("express");
const userRouter = express.Router();
const mongoose = require('mongoose');
const UserSchema = require('../Schema/SignupSchema');
const todoSchema = require('../Schema/TodoSchema');
const Todo = mongoose.model('todo', todoSchema, 'todo');
const AppUtils = require('../AppUtils');
const Constants = require('../Constants');
const User = mongoose.model('users', UserSchema, 'users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


userRouter.get('/', async (req, res) => {
    const user_id = req.query._id;

    if (!user_id) {
        res.status(400).json(AppUtils.generateMissingFieldError(Constants._id));
        return;
    }
    try {
        const user_data = await User.find();
        res.status(200).json(user_data);
    }
    catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
});

userRouter.put('/update', async (req, res) => {
    const request = req.body;
    if (!request.email) {
        res.status(400).json(AppUtils.generateMissingFieldError(Constants.EMAIL));
        return;
    }
    try {
        const user = await User.findOne({ email: request.email });
        const match = bcrypt.compare(request.old_password, user.password);
        if (match) {
            let password = "";
            if (request.new_password) {
                password = await AppUtils.encryptPassword(request.new_password);
            }
            else {
                password = user.password;
            }
            const user_data = await User.findOneAndUpdate({ email: request.email }, {
                name: request.name,
                email: request.email,
                date_of_birth: request.date_of_birth,
                password: password
            })
            await user_data.save();
            res.status(200).json({ user: user_data });
        }
        else {
            res.json({
                status: "USER NOT FOUND",
                message: "User not found"
            })
        }

    }
    catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
});



userRouter.delete('/delete',async(req,res)=>{
    const request=req.query._id;
    if(!request){
        res.status(400).json(AppUtils.generateMissingFieldError(Constants.ID));
    }
    try{
        await User.findOneAndDelete({_id:request});
        res.status(200).json(AppUtils.generateSuccess("USER DELETED","User Deleted Successfully"));
    }
    catch(err){
        res.status(500).json(AppUtils.generateError(err.code,err.message));
    }
});



module.exports = userRouter;