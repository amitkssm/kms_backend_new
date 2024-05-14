
const mongoose = require("mongoose");
const express = require("express");
const fs = require('fs')
const jwt = require('jsonwebtoken');
const multer = require("multer");
var bcrypt = require('bcryptjs');
var randomstring = require('randomstring');
const bodyParser = require('body-parser');
const ObjectId = require('mongoose').Types.ObjectId;
const cors = require("cors");
const controller = require('./api.contrroller')
const handler = require('./api.handler')

// var validator = require('gstin-validator');


require("./db/config");

const { Question, scenario_details, Registration, logs,Email_otp } = require("./db/schema")


const app = express();
app.use(express.json());
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send("Home Page Of KMS");
})

app.listen((2222), () => {
    console.log("app is running on port 2222")
})

//====================================== Function For handler.upload Image ===============================================//

app.post("/profile", handler.upload, (req, res) => {
    res.send("file upload")
});


// Protected route using the handler.verifyToken middleware
app.get('/protected', handler.verifyToken, controller.protected)

//=========================================== KMS API START =====================================================//

/************************ upload Documents API for Query ******************* */
app.post("/uploadDocuments", handler.upload, controller.uploadDocuments)

/************************ Get Documents API for Query ******************* */
app.get('/file/:path', controller.file)

/************************ Registration API for Users in KMS ******************* */
app.post("/registration", handler.upload, controller.Registration)

/************************ Login API for Users in KMS ******************* */
app.post("/login", handler.upload, controller.login)

/************************ Save Scenario of KMS ******************* */
app.post('/saveScenario', handler.verifyToken, controller.saveScenario)

/************************ Save Question and Options of KMS ******************* */
app.post("/saveQuestion", handler.verifyToken, controller.saveQuestion)

/************************ Get Question By Next and Pre Action Id Id of KMS ******************* */
app.post('/getQuestionById', handler.verifyToken, controller.getQuestionById)

/************************ Get Question by Scenerio Action Id of KMS ******************* */
app.post('/getQuestionByScenerio', handler.verifyToken, controller.getQuestionByScenerio)

/************************ Get All Questions and Options of KMS ******************* */
app.get('/getQuestion', handler.verifyToken, controller.getQuestion)

/************************ Get All Scenerio Categories Action Id of KMS ******************* */
app.get('/getscenario', handler.verifyToken, controller.getscenario)

/************************ Get All Expired Scenerio Categories Action Id of KMS ******************* */
app.get('/getExpiredScenario', controller.getExpiredScenario)

/************************ Get Items of Scenerio Action Id of KMS ********************** */
app.post('/getItemsScenerio', handler.verifyToken, controller.getItemsScenerio)

/************************ Edit Questions and Options of KMS ******************* */
app.post('/updateQuestion', handler.verifyToken, controller.updateQuestion)

/************************ Get Scenerio Details by Scenario Id of KMS ******************* */
app.post('/getscenarioDetails', handler.verifyToken, controller.getscenarioDetails)

/************************ Get Scenerio Details by Scenario Id of KMS ******************* */
app.post("/sceneraioDetails", handler.verifyToken, controller.sceneraioDetails)

/************************ Increase Count by Scenario Id of KMS ******************* */
app.post("/updateSceneraioCount", handler.verifyToken, controller.updateSceneraioCount)

/************************ Get Users based on user role of KMS ********************** */
app.post('/getUsersBasedOnUserRole', handler.verifyToken, controller.getUsersBasedOnUserRole)

/************************ Get Users based on Admin Id of KMS ********************** */
app.post('/getAgentBasedOnAdminId', handler.verifyToken, controller.getAgentBasedOnAdminId)

/************************ Get All Ranking wise Scenerio of KMS ******************* */
app.get('/getscenarioRankingWise', handler.verifyToken, controller.getscenarioRankingWise)

/************************ Get most view Scenerio Details Id of KMS ******************* */
app.get("/getMostViewSceneraioDetails", controller.getMostViewSceneraioDetails)

/************************ update User And Scenario For Time Spent ******************* */
app.post("/updateUserAndScenarioForTimeSpent", controller.updateUserAndScenarioForTimeSpent)

/************************ Get Users details with time spent of KMS ********************** */
app.post('/getUsersDetailsWithTimespent', handler.verifyToken, controller.getUsersDetailsWithTimespent)

/************************ Get scenario details with time spent of KMS ********************** */
app.post('/getScenarioDetailsWithTimespent', handler.verifyToken, controller.getScenarioDetailsWithTimespent)

/************************ Get Scenerio Details based on Category and AdminId of KMS ******************* */
app.post("/getScenarioBasedOnCatnAdm", handler.verifyToken, controller.getScenarioBasedOnCatnAdm)


/************************ Save Logs of KMS ******************* */
app.post('/logs', handler.verifyToken, controller.logs)

/************************ update Logs of KMS ******************* */
app.post("/updateLogs", handler.verifyToken, controller.updateLogs)

/************************ update Logs of KMS ******************* */
app.post("/getAgentDetailsBasedOnAgentId", controller.getAgentDetailsBasedOnAgentId)

/************************ update Logs of KMS ******************* */
app.post("/getAgentDetailsOfAdmin", controller.getAgentDetailsOfAdmin)

/************************ update Logs of KMS ******************* */
app.post("/getAgentLogsDetails", controller.getAgentLogsDetails)

app.post("/getSoftwareNames", controller.getSoftwareNames)

app.post("/getAllQuestionBasedOnScenarioId", controller.getAllQuestionBasedOnScenarioId)

/************************ Delete Qestions and Options bye Scene Id of KMS ******************* */
// app.post('/deleteSceine', controller.deleteSceine)

/////////////================= Start Forget Password throw Email Section =======================/////////////


//==================================== Function for generate unique token =====================================//

const crypto = require('crypto');

function generateUniqueToken() {
    return crypto.randomBytes(20).toString('hex');
}

// Example usage
const resetToken = generateUniqueToken();
// console.log(resetToken,"tokennnnnnnnnnnnnnn");

const nodemailer = require('nodemailer');

//==================================== Function for send mail =====================================//

// Configure nodemailer
const transporter = nodemailer.createTransport({
    // host: "email-smtp.us-east-1.amazonaws.com",
  host : "smtp.office365.com",
  protocol: "smtp",
  // port: 465,
  port: 587,
  auth: {
    user: "dysinfo@qdegrees.com",
    pass: "DoYourSurvey@DYS", 
  },
  rateLimit: 500,
  pool: true,
  maxConnections: 10,
  maxMessages: 100000,
});



//==================== API for Send OTP and Verify OTP By Email For Forgot Password ======================//

app.post('/sendOtpVerifyByEmail', async (req, res) => {
    console.log("AAAAAAAAAAAAAAAAAAAAAAA")
    const { email } = req.body;
    try {
        let user = await Registration.findOne({ email: email })
        if (!user) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "User not found.",
            });
        }
        // Generate random OTP
        const otp = randomstring.generate({
            length: 6,
            charset: 'numeric'
        });

        console.log(otp,"<<<<<<<<<<<<<111111111111111111")

        // Email options
        const mailOptions = {
            from: 'DoYourSurvey" dysinfo@qdegrees.com', // Replace with your Gmail address
            to: email,
            subject: 'OTP for Password Reset',
            text: `Your OTP is: ${otp}`
        };

        // console.log(mailOptions,"BBBBBBBBBBBBBBB")
        // res.status(201).json({ success: true, message: 'OTP sent successfully', mailOptions });
        // Send email
        transporter.sendMail(mailOptions,async (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                res.status(500).json({ success: false, message: 'Error sending OTP' });
            } else {
                let result = await Email_otp.findOneAndUpdate({ "email": email }, { "otp": generateOtp, "expire_in": Date.now() }, { upsert: true });
                let result1 = await Email_otp.findOne({ "email": email },{_id:1,email:1,expire_in:1});
                console.log('Email sent: ', info.response);
                if (result) {
                    return res.status(201).json({
                        error: false,
                        code: 201,
                        message: `OTP sent successfully`,
                        data: result1
                    })
                }
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: true,
            code: 500,
            message: "something went wrong"
        })
    }

});

app.post('/verifyOtpForEmail', async (req, res) => {

    try {
        if (req.body.email && req.body.email != "") {
            console.log("inside email otp sent")
            let email = req.body.email
            let otp = req.body.otp
            let result = await Email_otp.findOne({ "email": email },{_id:1,email:1,expire_in:1,otp:1})
            if (result && result.otp == otp) {
                res.status(200).json({
                    error: false,
                    code: 200,
                    message: `OTP successfully verified`,
                    data: result
                })
            } else {
                res.status(201).json({
                    error: true,
                    code: 201,
                    message: "OTP not correct"
                })
            }
        } else {
            res.status(400).json({
                error: true,
                code: 400,
                message: "Email not found"
            })
        }
    } catch (err) {
        res.status(500).json({
            error: true,
            code: 500,
            message: "something went wrong",
            data: err
        })
    }
})

//==================================== API for Reset password =====================================//

app.post('/forgetPassword', async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const email = req.body.email
    if (newPassword && confirmPassword && newPassword !== "") {
        if (newPassword == confirmPassword) {
            console.log("new password and confirm passwor match")
        } else {
            return res.status(201).json({
                error: true,
                code: 201,
                message: "password and confirm password not match"
            })
        }
    }
    else {
        return res.status(201).json({
            error: true,
            code: 201,
            message: "please enter password and confirm password"
        })
    }
    if (email) {
        Registration.findOne({ email }, async (err, user) => {
            if (err || !user) {

                return res.status(201).json({
                    error: true,
                    code: 201,
                    status: "failure",
                    message: "user does not exists !"
                })
            }
            else {


                let bPassword = await handler.bcryptPassword(newPassword)
                if (bPassword) {

                    Registration.updateOne({ email: user.email }, { $set: { password: bPassword } }, (error, docs) => {
                        if (!error && docs) {

                            return res.status(200).json({
                                error: false,
                                code: 200,
                                message: "Password Changed Successfully",
                                data: docs
                            });
                        }
                        else {
                            res.status(500).json({
                                error: true,
                                code: 500,
                                message: "error in updating password",
                                data: error
                            });
                        }
                    })
                } else {
                    res.status(201).json({
                        error: true,
                        code: 201,
                        message: "error in decrypt password"
                    })
                }

            }
        })
    }

})

/////////////================= End Forget Password Section =======================/////////////
