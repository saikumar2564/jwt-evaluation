const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { BlocklistModel } = require('../models/user.model');



const authentication = async (req, res, next) => {
    const tokens = req.headers?.authorization.split(" ");
    if (!tokens[0]) return res.status(401).send({ "message": "Provide tokens" });

    let token = tokens[0];
    const refreshToken = tokens[1]
    if (!token || !refreshToken) return res.status(401).send({ "message": "Unauthorized" });


    try {

        const blocked = await BlocklistModel.findOne({ token });
        if (blocked) return res.status(200).send({ "message": "Please Login" });

        jwt.verify(token, process.env.user_secret, async (err, decoded) => {
            if (err) {
                if (err.message === 'jwt expired') {
                    fetch('http://localhost:1230/user/newtoken', {
                        headers: {
                            Authorization: `${token} ${refreshToken}`
                        }
                    }).then(res => res.json())
                        .then(data => {
                            console.log(data)
                            if (data.message === 'Token generated') {

                                tokens[0] = data.token
                                token = data.token;

                                jwt.verify(token, process.env.user_secret, (err, decoded) => {
                                    if (err) {
                                        if (err.message === 'jwt expired') return res.status(200).send({ "message": "Please Login" });
                                        console.log(err);
                                    }

                                    req.body.user = decoded.userID
                                    req.role = decoded.role

                                    next()

                                })
                            }
                            if (data.message === 'Please Login') return res.status(200).send({ "message": "Please Login" });

                        })
                        .catch(err => console.log(err));

                }
                else console.log(err);
            }
            else {
                req.body.user = decoded.userID
                req.role = decoded.role

                next();
            }

        })

    } catch (error) {

        console.log(error);
        res.status(500).json('Internal Server Error');

    }
}

const authorize = (permittedRoles)=>{
    return (req,res,next)=>{
        if(permittedRoles.includes(req.role)) next();
        else {
            res.status(401).send({ "message": "Unauthorized" });
        }
    }
}

module.exports = {
    authentication,
    authorize
}