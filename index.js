

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
    res.send("Home Page Of KMS");
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

        let FindUser = await Registration.findOne({ mobile_number: mobile_number })
        
        if (FindUser) {
            res.status(200).json({
                error: false,
                code: 200,
                message: "Number all ready used, Please Try Another mobile number",
            })
        }
        else {

            let saveData = {

                profile_image: "https://kms-backend-new.vercel.app/uploads/" + file,
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
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error.message
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
app.post('/saveScenario', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/saveScenario")

    const question = await new scenario_details(req.body);
    question.save().then((question) => {
        res.status(201).json({
            error: false,
            code: 201,
            message: "Scenario save Successfully",
            data: question
        })
        console.log('save');
    }).catch((error) => {
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error
        })
    })

})

/************************ Save Question and Options of KMS ******************* */
app.post("/saveQuestion", verifyToken, async (req, res) => {
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
app.post('/getQuestionById', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getQuestionById")

    try {
        const actionId = req.body.actionId ? req.body.actionId : null
        const question = await Question.find({ pre: actionId });
        console.log('find');
        if (question) {
            console.log(question.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Question Fetched Successfully",
                data: question
            })
        }
    }
    catch (error) {
        res.status(400).send(error);
    }

});

/************************ Get Question by Scenerio Action Id of KMS ******************* */
app.post('/getQuestionByScenerio', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getQuestionByScenerio")

    try {
        const actionId = req.body.actionId ? req.body.actionId : null
        const question = await Question.find({ _id: ObjectId(actionId) });

        if (question) {
            console.log(question.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Question Fetched Successfully",
                data: question
            })
        }
    }
    catch (error) {
        res.status(400).send(error);
    }

});

/************************ Get All Questions and Options of KMS ******************* */
app.get('/getQuestion', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getQuestion")

    try {
        const result = await Question.find({}, { created_date: 0, __v: 0 });
        if (result) {
            console.log(result.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Question Fetched Successfully",
                data: result
            })
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});

/************************ Get All Scenerio Categories Action Id of KMS ******************* */
app.get('/getscenario', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getscenario")

    try {
        const result = await scenario_details.find({});
        if (result) {
            console.log(result.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Scenario Fetched Successfully",
                data: result
            })
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});

/************************ Get Items of Scenerio Action Id of KMS ********************** */
app.post('/getItemsScenerio', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getItemsScenerio")

    const scene = req.body.scene ? req.body.scene : ""
    try {
        const result = await Question.find({ scene: scene });
        if (result) {
            console.log(result.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Scenerio Items Fetched Successfully",
                data: result
            })
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});

/************************ Edit Questions and Options of KMS ******************* */
app.post('/updateQuestion', verifyToken, async (req, res) => {
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
app.post('/getscenarioDetails', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getscenarioDetails")

    const scenarioId = req.body.scenario_id ? req.body.scenario_id : ""

    try {
        const result = await scenario_details.find({ _id: ObjectId(scenarioId) });
        let count = await scenario_details.updateOne({ "_id": ObjectId(scenarioId) }, { "$inc": { "count": 1 } })
        if (result) {
            console.log(result.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Scenerio Details Fetched Successfully",
                data: result
            })
        }
    }
    catch (error) {
        res.status(400).send(error);
    }

});

/************************ Get Scenerio Details by Scenario Id of KMS ******************* */
app.post("/sceneraioDetails", verifyToken, (req, res) => {
    console.log("http://localhost:2222/sceneraioDetails")

    scenario_details.findOne({ _id: req.body.id }).then((data) => {
        res.status(201).json({
            error: false,
            code: 201,
            message: "Scenerio Details Fetched Successfully",
            data: data
        })
    })

})

/************************ Increase Count by Scenario Id of KMS ******************* */
app.post("/updateSceneraioCount", verifyToken, (req, res) => {
    console.log("http://localhost:2222/updateSceneraioCount")

    try {
        const scenarioId = req.body.scenario_id ? req.body.scenario_id : ""
        scenario_details.updateOne({ "_id": ObjectId(scenarioId) }, { "$inc": { "count": 1 } }).then((data) => {
            res.status(201).json({
                error: false,
                code: 201,
                message: "Update Sceneraio Count Successfully",
                data: data
            })
        })

    } catch (error) {
        res.status(400).send(error);
    }

})

/************************ Get Users based on user role of KMS ********************** */
app.post('/getUsersBasedOnUserRole', verifyToken, async (req, res) => {
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
app.post('/getAgentBasedOnAdminId', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getAgentBasedOnAdminId")

    const AdminId = req.body.admin_id ? req.body.admin_id : ""
    try {
        const result = await Registration.find({ admin_id: AdminId });
        if (result) {
            console.log(result.length);
            res.status(200).json({
                error: false,
                code: 200,
                message: "Successfully",
                data: result,
                count: result.length
            });
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});

/************************ Get All Ranking wise Scenerio Based on of KMS ******************* */
app.get('/getscenarioRankingWise', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getscenarioRankingWise")

    try {
        const result = await scenario_details.find({});
        let newArray = result.map(function (item) {
            return {
                scenario: item.scenario,
                circle: item.circle,
                liveDate: item.liveDate,
                expDate: item.expDate,
                brief: item.brief,
                actionId: item.actionId,
                count: item.count,
                // newProperty: 'x'
            }
        }).sort(function (x, z) {
            return z.count - x.count;
        });

        if (newArray) {
            console.log(result.length);
            res.status(201).json({
                error: true,
                code: 201,
                message: "Scenerio Details Fetched Successfully",
                data: newArray
            })
        }
    }
    catch (error) {
        res.status(400).send(err);
    }

});


/************************ update User And Scenario For Time Spent ******************* */
app.post("/updateUserAndScenarioForTimeSpent", verifyToken, (req, res) => {
    console.log("http://localhost:2222/updateUserAndScenarioForTimeSpent");

    try {
        const scenarioId = req.body.scenario_id ? req.body.scenario_id : "";
        const user_id = req.body.user_id ? req.body.user_id : "";
        const time_spent = req.body.time_spent ? parseInt(req.body.time_spent) : 0; // Convert time_spent to integer
        // Update Registration table
        Registration.findOneAndUpdate(
            {
                "_id": ObjectId(user_id),
                "time_spent.scenario_id": ObjectId(scenarioId)
            },
            { $inc: { "time_spent.$.time": time_spent }, $set: { modified: Date.now() } },
            { new: true }
        ).then((registrationData) => {
            if (!registrationData) {
                // If the combination doesn't exist, add a new entry in the Registration table
                Registration.updateOne(
                    { "_id": ObjectId(user_id) },
                    { $push: { time_spent: { scenario_id: ObjectId(scenarioId), time: time_spent } }, $set: { modified: Date.now() } }
                ).then(() => {
                    res.status(200).json({
                        error: false,
                        code: 200,
                        message: "Time Updated Successfully",
                        data: []
                    });
                });
            }

            // Update scenario_details table
            scenario_details.findOneAndUpdate(
                {
                    "_id": ObjectId(scenarioId),
                    "time_spent.user_id": ObjectId(user_id)
                },
                { $inc: { "time_spent.$.time": parseInt(time_spent) }, $set: { modified: Date.now() } },
                { new: true }
            ).then((scenarioDetailsData) => {
                if (!scenarioDetailsData) {
                    // If the combination doesn't exist, add a new entry in the scenario_details table
                    scenario_details.updateOne(
                        { "_id": ObjectId(scenarioId) },
                        { $push: { time_spent: { user_id: ObjectId(user_id), time: time_spent } }, $set: { modified: Date.now() } }
                    ).then(() => {
                        res.status(200).json({
                            error: false,
                            code: 200,
                            message: "Time Updated Successfully",
                            data: []
                        });
                    });
                } else {
                    // If the combination exists, update the time in the existing entry in the scenario_details table
                    res.status(200).json({
                        error: false,
                        code: 200,
                        message: "Time Updated Successfully",
                        data: []
                    });
                }
            });
        });

    } catch (error) {
        console.log("error::::", error)
        res.status(400).send(error);
    }
});

/************************ Get Users and Scenario details with time spent of KMS ********************** */
// app.post('/getUsersDetailsWithTimespentOld', verifyToken,  async (req, res) => {
//     console.log("http://localhost:2222/getUsersDetailsWithTimespent")

//     const scenario_id = req.body.scenario_id ? req.body.scenario_id : ""
//     const user_id = req.body.user_id ? req.body.user_id : ""
//     try {
//         const result = await scenario_details.aggregate([
//             {
//                 "$match": { "_id": ObjectId(scenario_id) }
//             },
//             {
//                 "$unwind": "$time_spent"
//             },
//             {
//                 "$lookup": {
//                     "from": "registrations",
//                     "let": { "userId": "$time_spent.user_id" },
//                     "pipeline": [
//                         {
//                             "$match": {
//                                 "$expr": {
//                                     "$eq": ["$_id", "$$userId"],
//                                 },
//                             },
//                         },
//                     ],
//                     "as": "user_details"
//                 }
//             },
//             // {
//             //     "$group": {
//             //         "_id": "$_id",
//             //         "scenario": { "$first": "$scenario" },
//             //         "actionId": { "$first": "$actionId" },
//             //         "created": { "$first": "$created" },
//             //         "modified": { "$first": "$modified" },
//             //         "__v": { "$first": "$__v" },
//             //         "count": { "$first": "$count" },
//             //         "time_spent": { "$push": "$time_spent" },
//             //         "user_details": { "$first": "$user_details" }
//             //     }
//             // }
//         ]);
//         if (result) {
//             console.log(result.length);
//             res.status(200).json({
//                 error: false,
//                 code: 200,
//                 message: "Successfully",
//                 data: result,
//                 count: result.length
//             });
//         }
//     }
//     catch (error) {
//         console.log(error)
//         res.status(400).send(error);
//     }

// });

/************************ Get Users details with time spent of KMS ********************** */
app.post('/getUsersDetailsWithTimespent', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getUsersDetailsWithTimespent");

    const scenario_id = req.body.scenario_id ? req.body.scenario_id : "";
    const user_id = req.body.user_id ? req.body.user_id : "";

    try {
        const result = await scenario_details.aggregate([
            {
                "$match": { "_id": ObjectId(scenario_id) }
            },
            {
                "$lookup": {
                    "from": "registrations",
                    "localField": "time_spent.user_id",
                    "foreignField": "_id",
                    "as": "user_details"
                }
            },
            {
                "$project": {
                    "scenario": 1,
                    "actionId": 1,
                    "created": 1,
                    "modified": 1,
                    "__v": 1,
                    "count": 1,
                    "time_spent": 1,
                    "user_details": {
                        "_id": 1,
                        "profile_image": 1,
                        "name": 1,
                        "mobile_number": 1,
                        "email": 1,
                        "user_role": 1,
                        "admin_id": 1,
                        "time_spent": 1,
                        "is_deleted": 1
                        // Add other fields you need from the registrations collection
                    }
                }
            }
        ]);

        if (result.length > 0) {
            res.status(200).json({
                error: false,
                code: 200,
                message: "Successfully",
                data: result[0], // Assuming you want a single scenario's details
            });
        } else {
            res.status(404).json({
                error: true,
                code: 404,
                message: "Scenario not found",
                data: [],
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal Server Error",
            data: [],
        });
    }
});

/************************ Get scenario details with time spent of KMS ********************** */
app.post('/getScenarioDetailsWithTimespent', verifyToken, async (req, res) => {
    console.log("http://localhost:2222/getScenarioDetailsWithTimespent");

    const scenario_id = req.body.scenario_id ? req.body.scenario_id : "";
    const user_id = req.body.user_id ? req.body.user_id : "";

    try {
        const result = await Registration.aggregate([
            {
                "$match": { "_id": ObjectId(user_id) }
            },
            {
                "$lookup": {
                    "from": "scenario_details",
                    "localField": "time_spent.scenario_id",
                    "foreignField": "_id",
                    "as": "scenario_details"
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "profile_image": 1,
                    "name": 1,
                    "mobile_number": 1,
                    "email": 1,
                    "user_role": 1,
                    "admin_id": 1,
                    "is_deleted": 1,
                    "time_spent": 1,
                    "scenario_details": {
                        "_id": 1,
                        "scenario": 1,
                        "circle": 1,
                        "brief": 1,
                        "expDate": 1,
                        "liveDate": 1,
                        "actionId": 1,
                        "count": 1,
                        "time_spent": 1,
                        // "created": 1,
                        // "modified": 1,
                        // Add other fields you need from the registrations collection
                    }
                }
            }
        ]);

        if (result.length > 0) {
            res.status(200).json({
                error: false,
                code: 200,
                message: "Successfully",
                data: result[0], // Assuming you want a single scenario's details
            });
        } else {
            res.status(404).json({
                error: true,
                code: 404,
                message: "Scenario not found",
                data: [],
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal Server Error",
            data: [],
        });
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
