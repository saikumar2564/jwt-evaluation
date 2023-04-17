const express = require('express');
const { connection } = require('./configs/db');
const { userRouter} = require('./routes/user.route');
const { authentication } = require('./middlewares/authentication.middleware');
const { blogRouter}=require('./routes/blog.route');
const app = express();
require('dotenv').config();


app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Working...')
});

app.use('',userRouter);

app.use(authentication);

app.use('/blogs',blogRouter);


const port = process.env.port || 4000
app.listen(port,async()=>{
    try{
        await connection;
        console.log("Connected to DB");
    }
    catch(err){
        console.log(err)
    }
    console.log(`Server is running at ${port}`);
})