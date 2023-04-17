const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true,
        unique:true
    },
    password: {
        type:String,
        required: true
    },
    role: {
        type:String,
        required: true,
        default:'User',
        enum: ['User', 'moderator']
    },
},{versionKey: false});

const UserModel = mongoose.model('User', userSchema);

const blogSchema = mongoose.Schema({
    title: {
        type:String,
        required: true
    },
    body: {
        type:String,
        required: true
    },
    comments: {
        type:[String],
        required: true
    },
    user: {
        type:String,
        required: true
    },
},{versionKey: false});

const BlogModel = mongoose.model('Blog', blogSchema);

const blocklistSchema = mongoose.Schema({
    token: {
        type:String,
        required: true
    }
    
},{versionKey: false});

const BlocklistModel = mongoose.model('blocklist', blocklistSchema);


module.exports = {
    UserModel,
    BlogModel,
    BlocklistModel
}