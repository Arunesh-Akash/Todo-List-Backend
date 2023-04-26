const express = require("express");
const signupRouter = express.Router();
const mongoose = require('mongoose');
const UserSchema = require('../Schema/SignupSchema');
const AppUtils=require('../AppUtils');
const Constants=require('../Constants');
const User = mongoose.model('users', UserSchema, 'users');
const jwt = require('jsonwebtoken');

signupRouter.post('/', async (req, res) => {

    const user = req.body;

    if (AppUtils.checkError(user, Constants.USER)) {
        res.status(400).json(AppUtils.checkError(user, Constants.USER));
        return;
    }

    try {
        user.password = await AppUtils.encryptPassword(user.password);
        user.email = user.email.toLowerCase();
        user.token = jwt.sign({ email: user.email }, Constants.SECRET_KEY);
        const newUser = new User(user);
        await newUser.save();
        res.json({
            success: true,
            message: "User created successfully",
            token: user.token,
        });
    } catch (err) {
        if (err.code == "11000")
            res
                .status(400)
                .json(
                    AppUtils.generateError("USER_ALREADY_EXISTS", "User Already Exists")
                );
        else res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
});







module.exports = signupRouter;