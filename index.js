
const mongoose = require("mongoose");
const express = require("express");
const fs = require('fs')
const jwt = require('jsonwebtoken');
const multer = require("multer");
var bcrypt = require('bcryptjs');
const ObjectId = require('mongoose').Types.ObjectId;
const cors = require("cors");
const controller = require('./api.contrroller')
const handler= require('./api.handler')

// var validator = require('gstin-validator');


require("./db/config");

const { Question, scenario_details, Registration, logs } = require("./db/schema")


const app = express();
app.use(express.json());
app.use(cors());


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
app.get('/getExpiredScenario',  controller.getExpiredScenario)

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
app.get('/getscenarioRankingWise', handler.verifyToken,  controller.getscenarioRankingWise)

/************************ Get most view Scenerio Details Id of KMS ******************* */
app.get("/getMostViewSceneraioDetails", controller.getMostViewSceneraioDetails)

/************************ update User And Scenario For Time Spent ******************* */
app.post("/updateUserAndScenarioForTimeSpent", controller.updateUserAndScenarioForTimeSpent)

/************************ Get Users and Scenario details with time spent of KMS ********************** */
// app.post('/getUsersDetailsWithTimespentOld', handler.verifyToken,  controller.getUsersDetailsWithTimespentOld)

/************************ Get Users details with time spent of KMS ********************** */
app.post('/getUsersDetailsWithTimespent', handler.verifyToken, controller.getUsersDetailsWithTimespent)

/************************ Get scenario details with time spent of KMS ********************** */
app.post('/getScenarioDetailsWithTimespent', handler.verifyToken, controller.getScenarioDetailsWithTimespent)

/************************ Get Scenerio Details based on Category and AdminId of KMS ******************* */
app.post("/getScenarioBasedOnCatnAdm", handler.verifyToken,controller.getScenarioBasedOnCatnAdm)


/************************ Save Logs of KMS ******************* */
app.post('/logs',handler.verifyToken,controller.logs)

/************************ update Logs of KMS ******************* */
app.post("/updateLogs",handler.verifyToken, controller.updateLogs)

/************************ update Logs of KMS ******************* */
app.post("/getAgentDetailsBasedOnAgentId", controller.getAgentDetailsBasedOnAgentId)

/************************ update Logs of KMS ******************* */
app.post("/getAgentDetailsOfAdmin", controller.getAgentDetailsOfAdmin)

/************************ update Logs of KMS ******************* */
app.post("/getAgentLogsDetails", controller.getAgentLogsDetails)

app.post("/getSoftwareNames", controller.getSoftwareNames)

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

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'amitkssm91@gmail.com', // replace with your email address
        pass: '8340110350', // replace with your email password or app-specific password
    },
});

// Function to send reset password email
function sendResetPasswordEmail(userEmail, resetToken) {
    const mailOptions = {
        from: 'amitkssm91@gmail.com', // replace with your email address
        to: userEmail,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: http://your-app-url/reset-password?token=${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

//==================================== Function for reset Password =====================================//

// Function to send reset password email
function sendResetPasswordEmail(userEmail, resetToken) {
    const mailOptions = {
        from: 'amit.kumar1@qdegrees.org',
        to: userEmail,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: http://your-app-url/reset-password?token=${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

//==================================== API for Forget password =====================================//

app.post("/forgot-password", async (req, res) => {
    try {
        const email = req.body.email;
        const user = await Registration.findOne({ email: email });

        if (!user) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "User not found.",
            });
        }

        // Generate a unique token or temporary password reset link
        const resetToken = generateUniqueToken(); // Implement this function
        console.log(resetToken, "pppppppppppaaaaaaaaaaaaaaaa")
        // Store the token, user ID, and expiration time in the database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send an email to the user with the reset link
        sendResetPasswordEmail(user.email, resetToken); // Implement this function

        res.status(200).json({
            success: true,
            message: "Password reset instructions sent to your email.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Something went wrong.",
            data: error,
        });
    }
});

//==================================== API for Reset password =====================================//

app.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await Registration.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                error: true,
                code: 400,
                message: "Invalid or expired token.",
            });
        }

        // Update the user's password
        user.password = await bcryptPassword(newPassword); // Implement this function
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password successfully reset.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Something went wrong.",
            data: error,
        });
    }
});

/////////////================= End Forget Password Section =======================/////////////
