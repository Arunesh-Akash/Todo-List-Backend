const express = require('express');
const mongoose = require('mongoose');
const todoRouter = express.Router();
const todoSchema = require('../Schema/TodoSchema');
const Todo = mongoose.model('todo', todoSchema, 'todo');
const UserSchema = require('../Schema/SignupSchema');
const User = mongoose.model('users', UserSchema, 'users');
const AppUtils = require('../AppUtils');
const Constants = require('../Constants');
const Protect = require('../Middleware/Protect');
const { Types: { ObjectId } } = require('mongoose');

todoRouter.post('/', Protect, async (req, res) => {
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
        const data = new Todo({
            title: request.title,
            description: request.description,
            status: 'todo'
        });
        await data.save();
        const user = await User.findOne({ email: user_id });
        user.todo_data.push({
            _id: data._id,
            title: data.title,
            description: data.description,
            status: data.status
        });
        user.save();
        res.status(200).json({_id:data._id});

    }
    catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
});

todoRouter.get('/', Protect, async (req, res) => {
    const userData = req.query.email;
    try {
        if (!userData) {
            return res.status(400).json({ error: 'Missing email parameter' });
        }

        const data = await User.findOne({ email: userData });
        if (!data || !data.todo_data) {
            return res.status(404).json({ error: 'User or todo data not found' });
        }
        const todoItems = data.todo_data.map(items => ({
            _id:items._id,
            title: items.title,
            description: items.description,
            status:items.status
        }))
        res.status(200).json(todoItems);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

todoRouter.put('/move-to-inprogress', async (req, res) => {
    try {
        const { todoId, email } = req.query;
        const objectIdString = todoId;
        const objectId = new ObjectId(objectIdString);
        const updateTodo = await Todo.findByIdAndUpdate(objectId, { status: 'in_progress' }, { new: true });

        if (!updateTodo) {
            return res.status(404).json({ error: 'Todo item not found' });
        }
        const updateUserTodo = await User.findOneAndUpdate(
            { email: email, 'todo_data._id': objectId },
            { $set: { 'todo_data.$.status': 'in_progress' } },
            { new: true }
        );
        console.log('updateTodo:', updateTodo); 
        console.log('updateUserTodo:', updateUserTodo)
        if (!updateUserTodo) {
            return res.status(404).json({ error: 'User document not found or todo item not in user data' });
        }

        return res.status(200).json({ message: 'Todo moved to in progress', todo: updateTodo, user: updateUserTodo });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



todoRouter.put('/move-to-done', async (req, res) => {
    try {
        const { todoId, email } = req.query;
        const todoIdString = todoId;
        const todoObjectId = new ObjectId(todoIdString);
        const updateTodo = await Todo.findByIdAndUpdate(todoObjectId, { status: 'done' }, { new: true });

        if (!updateTodo) {
            return res.status(404).json({ error: 'Todo item not found' });
        }
        const updateUserTodo = await User.findOneAndUpdate(
            { email: email, 'todo_data._id': todoObjectId },
            { $set: { 'todo_data.$.status': 'done' } },
            { new: true });

        if (!updateUserTodo) {
            return res.status(404).json({ error: 'User document not found or todo item not in user data' });
        }
        return res.status(200).json({ message: 'Todo moved to done', todo: updateTodo, userTodo: updateUserTodo });
    } catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
})


todoRouter.delete('/delete', async (req, res) => {
    
    try {
        const request_id = req.query.todoId;
        const request_email = req.query.email;
        if (!request_id) {
            res.status(400).json(AppUtils.generateError("DATA NOT FOUND", "Data not found"));
            return;
        }
        const user = await User.findOne({ email: request_email });
        user.todo_data.splice(user.todo_data.indexOf(request_id), 1);
        user.save();
        const todoObjectId=new ObjectId(request_id)
        await Todo.findOneAndDelete({ _id: todoObjectId});
        res.status(200).json(AppUtils.generateSuccess("SUCCESSFULLY DELETED", "Successfully Deleted"));
    }
    catch (err) {
        res.status(500).json(AppUtils.generateError(err.code, err.message));
    }
})




module.exports = todoRouter;