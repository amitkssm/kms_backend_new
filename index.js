
const mongoose = require("mongoose");
const express = require("express");
const fs = require('fs')
const jwt = require('jsonwebtoken');
const multer = require("multer");
var bcrypt = require('bcryptjs');
var randomstring = require('randomstring');
const bodyParser = require('body-parser');
var moment = require('moment');
const path = require('path');
const https = require('https');



const ObjectId = require('mongoose').Types.ObjectId;
const cors = require("cors");
// const controller = require('./api.contrroller')
// const handler = require('./api.handler')



// var validator = require('gstin-validator');


require("./db/config");



const app = express();
app.use(express.json());
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send("Home Page of Edu guru");
})

app.listen((3006), () => {
    console.log("app is running on port 3006")
})

// let server;
// const options = {
//     key: fs.readFileSync(path.join(`./SSL/kms.qdegrees.pem`)),//ssl.key
    
//     cert: fs.readFileSync(path.join(`./SSL/kms.qdegrees.crt`))  //ssl.cert
//     };
//     console.log(options);

//     server = https.createServer(options, app);

// app.get('/', (req, res) => {
//     res.send("Home Page Of KMS");
// })

// server.listen((3006), () => {
//     console.info(`Express server listening on PORT: 3006`)
// });

//====================================== Function For handler.upload Image ===============================================//

// app.post("/profile", handler.upload, (req, res) => {
//     res.send("file upload")
// });


// // Protected route using the handler.verifyToken middleware
// app.get('/protected', handler.verifyToken, controller.protected)

// //=========================================== KMS API START =====================================================//

// /************************ upload Documents API for Query ******************* */
// app.post("/uploadDocuments", handler.upload, controller.uploadDocuments)

// /************************ Get Documents API for Query ******************* */
// app.get('/file/:path', controller.file)



const adminRoute=require("./admin/index")

const frontUserRoute=require("./frontUsers/index")

/************************ Login API for Users in KMS ******************* */
app.use("/admin",adminRoute);

app.use("/front_user",frontUserRoute);


/************************ Save Question and Options of KMS ******************* */














