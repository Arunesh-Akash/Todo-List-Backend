const express = require('express');
const mongoose = require('mongoose');
const todoRouter = express.Router();
const todoSchema = require('../Schema/TodoSchema');
const Todo = mongoose.model('todo', todoSchema, 'todo');
const UserSchema = require('../Schema/SignupSchema');
const User = mongoose.model('users', UserSchema, 'users');
const AppUtils = require('../AppUtils');
const Constants = require('../Constants');


todoRouter.post('/', async (req, res) => {
    const user_id = req.query.email;
    const request = {
        title: req.body[Constants.TODO_DETAILS.TITLE],
        description: req.body[Constants.TODO_DETAILS.DESCRIPTION]
    }

    if (AppUtils.checkError(request, Constants.TODO_DETAILS)) {
        res.status(400).json(AppUtils.checkError(request, Constants.TODO_DETAILS));
        return;
    }
    try {
        const data = new Todo(request);
        await data.save();
        const user = await User.findOne({ email: user_id });
        user.todo_data.push({
            _id: data._id,
            title: data.title,
            description: data.description
        });
        user.save();
        res.status(200).json(AppUtils.generateSuccess("DATA ADDED", "Data is added successfully"));

    }
    catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
});

todoRouter.get('/', async (req, res) => {
    const data = req.query._id;

    if (!data) {
        res.status(400).json(AppUtils.generateMissingFieldError(Constants._id));
        return;
    }
    try {
        const user = await Todo.findOne({ _id: data });
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json(AppUtils.generateError("NOT FOUND", "Not Found"));
        }
    }
    catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
});

todoRouter.put('/update', async (req, res) => {
    const request = req.body
    if (!request._id) {
        res.status(400).json(AppUtils.generateMissingFieldError(Constants._id));
        return;
    }
    try {
        const data = await Todo.findOneAndUpdate(
            { _id: request._id },
            {
                title: request.title,
                description: request.description
            });


        await data.save().then(result => console.log(result)).catch(err => console.error(err));
        const user = await User.findOne({ email: request.email });
        // user.todo_data.push({
        //     title: data.title,
        //     description: data.description
        // });
        // await user.save();
        res.status(200).json(AppUtils.generateSuccess("SUCCESSFULLY UPDATED", "Successfully Updated"));
    }
    catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
});

todoRouter.post('/delete', async (req, res) => {
    const request_id = req.body._id;
    const request_email = req.body.email;
    if (!request_id) {
        res.status(400).json(AppUtils.generateError("DATA NOT FOUND", "Data not found"));
        return;
    }

    try {
        const user = await User.findOne({ email: request_email });
        user.todo_data.splice(user.todo_data.indexOf(request_id), 1);
        user.save();
        await Todo.findOneAndDelete({ _id: request_id });
        res.status(200).json(AppUtils.generateSuccess("SUCCESSFULLY DELETED", "Successfully Deleted"));
    }
    catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
})




module.exports = todoRouter;