

const express = require("express");
const mongoose = require("mongoose");
const fs = require('fs')
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

//==========================================================================================//

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


//==================================== KMS API START =====================================//

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
            const isMatch = await decryptPassword(password1, user.password)
            if (isMatch) {

                res.status(201).json({
                    error: true,
                    code: 201,
                    message: "User Logged In",
                    result: user
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
app.post('/saveScenario', async (req, res) => {
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
app.post("/saveQuestion", async (req, res) => {
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
app.post('/getQuestionById', async (req, res) => {
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
app.post('/getQuestionByScenerio', async (req, res) => {
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
app.get('/getQuestion', async (req, res) => {
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
app.get('/getscenario', async (req, res) => {
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

/************************ Get Items of Scenerio Action Id of KMS ******************* */
app.post('/getItemsScenerio', async (req, res) => {
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
app.post('/updateQuestion', async (req, res) => {
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
app.post('/getscenarioDetails', async (req, res) => {
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
app.post("/sceneraioDetails", (req, res) => {
    console.log("http://localhost:2222/sceneraioDetails")

    scenario_details.findOne({ _id: req.body.id }).then((data) => {
        res.send(data)
    })

})

/************************ Increase Count by Scenario Id of KMS ******************* */
app.post("/updateSceneraioCount", (req, res) => {
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





/************************ Delete Qestions and Options bye Scene Id of KMS ******************* */
// app.post('/deleteSceine', async (req, res) => {
//          console.log("http://localhost:2222/deleteSceine")

//     let id = req.body.id
//     // const deleteData = await Question.deleteMany({scene:id})
//     if (deleteData) {
//         res.status(201).send(deleteData);
//     }
// })



