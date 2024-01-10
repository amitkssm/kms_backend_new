

const express = require("express");
const mongoose = require("mongoose");
const fs = require('fs')
const jwt = require('jsonwebtoken');
const multer = require("multer");
var bcrypt = require('bcryptjs');
const ObjectId = require('mongoose').Types.ObjectId;
const cors = require("cors");

// var validator = require('gstin-validator');


require("./db/config");

const { Question, scenario_details, Registration } = require("./db/question")


const app = express();
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send("home page");
})

app.listen((2222), () => {
    console.log("app is running on port 2222")
})

//====================================== Function For Upload Image ===============================================//

const upload = multer({

    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads")
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + ".jpg")
        }
    })
}).single("image");
app.post("/profile", upload, (req, res) => {
    res.send("file upload")
});

//==================================== Function for Bcrypt and Decrypt Password =====================================//

const bcryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)
    console.log(hashedPassword)
    return hashedPassword;
}
const decryptPassword = async (getpassword, userpassword) => {
    const validPass = await bcrypt.compare(getpassword, userpassword)
    return validPass;
}

//====================================== Function For JWT ===============================================//

const secretKey = 'kms-ak-node'; // Replace with your own secret key

// Middleware to check JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized : Missing token' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden : Invalid token' });
    }

    req.user = user;
    next();
  });
};

// Protected route using the verifyToken middleware
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});


//=========================================== KMS API START =====================================================//

/************************ Registration API for Users in KMS ******************* */
app.post("/registration", upload, async (req, res) => {
    console.log("http://localhost:2222/registration")

    try {

        let profile_image = req.file.image ? req.file.image : ""
        let name = req.body.name ? req.body.name : ""
        let mobile_number = req.body.mobile_number ? req.body.mobile_number : ""
        let email = req.body.email ? req.body.email : ""
        let password = req.body.password ? req.body.password : ""
        let user_role = req.body.user_role ? req.body.user_role : ""
        let admin_id = req.body.admin_id ? req.body.admin_id : ""

        let file = profile_image.fieldname + "-" + Date.now() + ".jpg"
        let bPassword = await bcryptPassword(password)

        let saveData = {

            profile_image: "http://localhost:2222/uploads/" + file,
            name: name,
            mobile_number: mobile_number,
            email: email,
            password: bPassword,
            user_role: user_role,
            admin_id: admin_id

        }
        let result = await Registration.create(saveData)

        if (result) {
            res.status(200).json({
                error: false,
                code: 200,
                message: "Registered Successfully",
                data: result
            })
        } else {
            res.status(404).json({
                error: true,
                code: 404,
                message: "Not Registered",
            })
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error
        })
    }

});

/************************ Login API for Users in KMS ******************* */
app.post("/login", upload, async (req, res) => {
    console.log("http://localhost:2222/login")

    try {
        let email = req.body.email ? req.body.email : ""
        let password1 = req.body.password ? req.body.password : ""
        let user = await Registration.findOne({ email: email })
        if (user === null) {
            res.status(404).json({
                error: true,
                code: 404,
                message: "User not found.",
            })
        }
        else {
            const token = jwt.sign({ email }, secretKey);
            const isMatch = await decryptPassword(password1, user.password)
            if (isMatch) {
                res.status(201).json({
                    error: false,
                    code: 201,
                    message: "User Logged In",
                    result: user,
                    token: token
                })
            }
            else {
                return res.status(400).send({
                    message: "Wrong Password"
                });
            }
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error
        })
    }

});

/************************ Save category of KMS ******************* */
app.post('/saveScenario',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/saveScenario")

    const question = await new scenario_details(req.body);
    question.save().then((question) => {
        res.status(201).send(question);
        console.log('save');
    }).catch((error) => {
        res.status(400).send(error);
    })

})

/************************ Save Question and Options of KMS ******************* */
app.post("/saveQuestion",verifyToken, async (req, res) => {
    console.log("http://localhost:2222/saveQuestion")

    console.log(req.body.data[0].options)
    let count = 0
    let data = req.body.data
    let savedQuestion
    try {
        for (let i = 0; i < data.length; i++) {
            let question = data[i].question ? data[i].question : ""
            let options = data[i].options ? data[i].options : []
            let tables = data[i].tables ? data[i].tables : []
            let pre = data[i].pre ? data[i].pre : ""
            let scene = req.body.scene

            let saveData = {

                question: question,
                pre: pre,
                options: options,
                tables: tables,
                scene: scene,
                start: data[i].start ? data[i].start : 0

            }

            Question.create(saveData).then((result) => {
                console.log(result)
                if (result.start) {
                    savedQuestion = result
                }

                if (result) {
                    count++
                    if (count == data.length) {
                        scenario_details.updateOne({ _id: scene }, { $set: { actionId: savedQuestion._id } }).then((data) => {
                            res.status(200).json({
                                error: false,
                                code: 200,
                                message: "Save Successfully",
                                data: savedQuestion
                            })
                        })
                    }

                } else {
                    res.status(404).json({
                        error: true,
                        code: 404,
                        message: "",
                    })
                }
            })
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error
        })
    }

});

/************************ Get Question By Next and Pre Action Id Id of KMS ******************* */
app.post('/getQuestionById',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getQuestionById")

    try {
        const actionId = req.body.actionId ? req.body.actionId : null
        const question = await Question.find({ pre: actionId });
        console.log('find');
        if (question) {
            console.log(question.length);
            res.status(201).send(question);
        }
    }
    catch (error) {
        res.status(400).send(error);
    }

});

/************************ Get Question by Scenerio Action Id of KMS ******************* */
app.post('/getQuestionByScenerio',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getQuestionByScenerio")

    try {
        const actionId = req.body.actionId ? req.body.actionId : null
        const question = await Question.find({ _id: actionId });

        if (question) {
            console.log(question.length);
            res.status(201).send(question);
        }
    }
    catch (error) {
        res.status(400).send(error);
    }

});

/************************ Get All Questions and Options of KMS ******************* */
app.get('/getQuestion',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getQuestion")

    try {
        const result = await Question.find({}, { created_date: 0, __v: 0 });
        if (result) {
            console.log(result.length);
            res.status(201).send(result);
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});

/************************ Get All Scenerio Categories Action Id of KMS ******************* */
app.get('/getscenario',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getscenario")

    try {
        const result = await scenario_details.find({});
        if (result) {
            console.log(result.length);
            res.status(201).send(result);
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});

/************************ Get Items of Scenerio Action Id of KMS ********************** */
app.post('/getItemsScenerio',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getItemsScenerio")

    const scene = req.body.scene ? req.body.scene : ""
    try {
        const result = await Question.find({ scene: scene });
        if (result) {
            console.log(result.length);
            res.status(201).send(result);
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});

/************************ Edit Questions and Options of KMS ******************* */
app.post('/updateQuestion',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/updateQuestion")

    try {
        let data = req.body.data ? req.body.data : []
        let result

        for (i = 0; i < data.length; i++) {
            let id = data[i]._id
            delete data[i]._id
            result = await Question.updateOne({ _id: ObjectId(id) }, { $set: data[i] }, { new: true });
        }

        if (result) {
            console.log(result);
            res.status(200).json({
                error: false,
                code: 200,
                message: "Update Successfully",
                data: []
            });
        }
    }
    catch (error) {
        res.status(400).send(error);
    }

})

/************************ Get Scenerio Details by Scenario Id of KMS ******************* */
app.post('/getscenarioDetails',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getscenarioDetails")

    const scenarioId = req.body.scenario_id ? req.body.scenario_id : ""

    try {
        const result = await scenario_details.find({ _id: ObjectId(scenarioId) });
        let count = await scenario_details.updateOne({ "_id": ObjectId(scenarioId) }, { "$inc": { "count": 1 } })
        if (result) {
            console.log(result.length);
            res.status(201).send(result);
        }
    }
    catch (error) {
        res.status(400).send(error);
    }

});

/************************ Get Scenerio Details by Scenario Id of KMS ******************* */
app.post("/sceneraioDetails", verifyToken,(req, res) => {
    console.log("http://localhost:2222/sceneraioDetails")

    scenario_details.findOne({ _id: req.body.id }).then((data) => {
        res.send(data)
    })

})

/************************ Increase Count by Scenario Id of KMS ******************* */
app.post("/updateSceneraioCount",verifyToken, (req, res) => {
    console.log("http://localhost:2222/updateSceneraioCount")

    try {
        const scenarioId = req.body.scenario_id ? req.body.scenario_id : ""
        scenario_details.updateOne({ "_id": ObjectId(scenarioId) }, { "$inc": { "count": 1 } }).then((data) => {
            res.send(data)
        })

    } catch (error) {
        res.status(400).send(error);
    }

})

/************************ Get Users based on user role of KMS ********************** */
app.post('/getUsersBasedOnUserRole',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getUsersBasedOnUserRole")

    const userRole = req.body.user_role ? req.body.user_role : ""
    try {
        const result = await Registration.find({ user_role: userRole });
        if (result) {
            console.log(result.length);
            res.status(200).json({
                error: false,
                code: 200,
                message: "Update Successfully",
                data: result,
                count: result.length
            });
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});

/************************ Get Users based on Admin Id of KMS ********************** */
app.post('/getAgentBasedOnAdminId',verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getAgentBasedOnAdminId")

    const AdminId = req.body.admin_id ? req.body.admin_id : ""
    try {
        const result = await Registration.find({ admin_id: AdminId });
        if (result) {
            console.log(result.length);
            res.status(200).json({
                error: false,
                code: 200,
                message: "Update Successfully",
                data: result,
                count: result.length
            });
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});




/************************ Delete Qestions and Options bye Scene Id of KMS ******************* */
// app.post('/deleteSceine', async (req, res) => {
//          console.log("http://localhost:2222/deleteSceine")

//     let id = req.body.id
//     // const deleteData = await Question.deleteMany({scene:id})
//     if (deleteData) {
//         res.status(201).send(deleteData);
//     }
// })

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
        console.log(resetToken,"pppppppppppaaaaaaaaaaaaaaaa")
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
