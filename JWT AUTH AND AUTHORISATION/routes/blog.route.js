const express = require('express');
const blogRouter = express.Router();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { BlogModel } = require('../models/user.model');
const { authorize } = require('../middlewares/authentication.middleware');


blogRouter.post('/add',authorize(['User']), async(req,res)=>{
    const payload = req.body;
    try {
        const addBlog = new BlogModel(payload);
        await addBlog.save();

       res.status(200).json({msg:"Blog added", blog: addBlog});
    } catch (error) {
        console.log(err);
        res.status(500).json('Internal Server Error');
    }
});


blogRouter.get('/getall',authorize(['User', "moderator"]),async(req,res)=>{
    try {
        const blogs = await BlogModel.find();

        if(!blogs[0]) return res.status(200).json('No blogs exists');

       res.status(200).send(blogs);

    } catch (error) {
        console.log(err);
        res.status(500).json('Internal Server Error');
    }
});

blogRouter.delete('/moderator/delete/:id',authorize(["moderator"]),async(req,res)=>{
    const {id} = req.params;
    try {
        const blog = await BlogModel.findOne({_id:id});
        if(!blog) return res.status(200).json('No blogs exists');

        await BlogModel.findByIdAndDelete({_id:id});


       res.status(200).send({"message": "A blog deleted", blog});

    } catch (error) {
        console.log(err);
        res.status(500).json('Internal Server Error');
    }
});

blogRouter.delete('/delete/:id',authorize(["User"]),async(req,res)=>{
    const {id} = req.params;
    try {
        const blog = await BlogModel.findOne({_id:id});
        if(!blog) return res.status(200).json('No blogs exists');

        await BlogModel.findByIdAndDelete({_id:id});


       res.status(200).send({"message": "A blog deleted", blog});

    } catch (error) {
        console.log(err);
        res.status(500).json('Internal Server Error');
    }
});




module.exports = {
    blogRouter
}