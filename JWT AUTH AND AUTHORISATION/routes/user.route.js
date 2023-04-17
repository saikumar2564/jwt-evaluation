const express = require('express');
const userRouter = express.Router();
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel, BlocklistModel } = require('../models/user.model');


userRouter.post('/register', async(req,res)=>{
    const payload = req.body;
    try {
        
        const existedUser = await UserModel.findOne({email: payload.email});
        if(existedUser) return res.json({message: "User Existed, Please Login"});

        bcrypt.hash(payload.password, 5, async(err, hash)=>{
           
            if(err) {
                console.log(err)
                return res.status(400).json({message: "Something went Wrong"})
            }

            payload.password = hash;
            const user = new UserModel(payload);
            await user.save();

            res.status(200).json(user);
        })

    } catch (error) {
        console.log(err);
        res.status(500).json('Internal Server Error');
    }
});


userRouter.post('/login', async(req,res)=>{
    const payload = req.body;
    try {
        const findUser = await UserModel.findOne({email: payload.email});
        if(!findUser) return res.json({message: "User not found, Please Register"});

        bcrypt.compare(payload.password, findUser.password, async(err, result)=>{
           
            if(err) {
                console.log(err)
                return res.status(400).json({message: "Something went Wrong"})
            }

            if(!result) {
                return res.status(400).json({message: "Wrong Credentials"})
            }

            const data = {
                userID : findUser._id,
                role : findUser.role
            }

            const token = jwt.sign(data, process.env.user_secret, {expiresIn: '1m'});
            const refreshToken = jwt.sign(data, process.env.moderator_secret, {expiresIn: '3m'});
            
            res.status(200).json({
                message: "Login Success",
                token:token,
                refreshToken:refreshToken
            });
        })
    } catch (error) {
        console.log(err);
        res.status(500).json('Internal Server Error');
    }
});


userRouter.get('/logout', async(req,res)=>{
    const token = req.headers?.authorization;
    if(!token) return res.status(400).send({"message":"Please Provide Token"});

    try {
        
        const block = new BlocklistModel({token});
        await block.save();

        res.status(200).json({message: "Loggout Success"})

    } catch (error) {
        console.log(err);
        res.status(500).json('Internal Server Error');
    }
});


userRouter.get('/newtoken', async(req,res)=>{
    const tokens = req.headers?.authorization.split(" ");
    const token = tokens[0];
    const refreshToken = tokens[1]
    if(!token || !refreshToken) return res.status(400).send({"message":"Please Provide Token"});

    try {
        
        const blocked = await BlocklistModel.findOne({token});
        if(blocked) return res.status(200).send({"message":"Please Login"});

        jwt.verify(refreshToken, process.env.moderator_secret, (err, decoded)=>{
            if(err)
            {
                if(err.message==='jwt expired') return res.status(200).send({"message":"Please Login"});
                console.log(err);
            } 

            const data = {
                userID : decoded.userID,
                role : decoded.role
            }

            const newtoken = jwt.sign(data, process.env.user_secret, {expiresIn: '1m'});

            res.status(200).json({
                message: "Token generated",
                token:newtoken
            });

        })

    } catch (error) {
        console.log(error);
        res.status(500).json('Internal Server Error');
    }
});









module.exports = {
    userRouter
}