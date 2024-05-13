const fs = require('fs')
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;

const secretKey = 'kms-ak-node';
const handler = require('./api.handler')

const { Question, scenario_details, Registration, logs } = require("./db/schema")



// Protected route using the verifyToken middleware ////////////////////////////////
exports.protected =  (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
};

/*************************** Upload Documents API for Query ********************** */
exports.uploadDocuments = (req, res) => {

    res.status(200).json({
        error: false,
        code: 200,
        message: "File Upload Successfully",
        file: req.file.filename
    })
};

/*************************** Get Documents API for Query ************************* */
exports.file = (req, res) => {
    fs.readFile("uploads/" + req.params.path, (err, data) => {
        console.log(err)
        res.end(data)
    })
};

/*************************** Login API for Users in KMS ************************** */
exports.login = async (req, res) => {
    console.log("/login")

    try {
        let email = req.body.email ? req.body.email : ""
        let password1 = req.body.password ? req.body.password : ""
        let user = await Registration.findOne({ email: email.toLowerCase().trim() })
        if (user === null) {
            res.status(400).json({
                error: true,
                code: 200,
                message: "User not found.",
            })
        }
        else {
            const token = jwt.sign({ email }, secretKey);
            const isMatch = await handler.decryptPassword(password1, user.password)
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

};

/************************ Registration API for Users in KMS ************************ */
exports.Registration = async (req, res) => {
    console.log("/registration")

    try {

        let profile_image = req.file.image ? req.file.image : ""
        let name = req.body.name ? req.body.name : ""
        let mobile_number = req.body.mobile_number ? req.body.mobile_number : ""
        let email = req.body.email ? req.body.email : ""
        let password = req.body.password ? req.body.password : ""
        let user_role = req.body.user_role ? req.body.user_role : ""
        let admin_id = req.body.admin_id ? req.body.admin_id : ""
        let category = req.body.category ? req.body.category : ""

        let file = req.file.filename
        let bPassword = await handler.bcryptPassword(password)

        function validateEmail(email) {
            var regex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
            return regex.test(email);
        }

        function validatePhoneNumber(mobile_number) {
            var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            return regex.test(mobile_number)
        }

        if (validateEmail(email)) {
            console.log("Valid email!");

            if (validatePhoneNumber(mobile_number)) {
                console.log("Valid phone number!");

                let FindUser = await Registration.findOne({ mobile_number: mobile_number })
                if (FindUser) {
                    res.status(400).json({
                        error: false,
                        code: 400,
                        message: "Mobile Number exist, Please Try with another number !!!",
                    })
                }
                else {

                    let saveData = {

                        // profile_image: "http://localhost:2222/uploads/" + file,
                        profile_image: file,
                        name: name,
                        mobile_number: mobile_number,
                        email: email.toLowerCase().trim(),
                        password: bPassword,
                        user_role: user_role,
                        admin_id: admin_id,
                        category: category,

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
            } else {
                console.log("Invalid phone number!");
                res.status(400).json({
                    error: true,
                    code: 400,
                    message: "Invalid phone number!",
                })
            }
        } else {
            console.log("Invalid email!");
            res.status(400).json({
                error: true,
                code: 400,
                message: "Invalid email!",
            });
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

};

/**************************** Save Scenario of KMS ********************************* */
exports.saveScenario = async (req, res) => {
    console.log("/saveScenario")

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
        console.log(error)
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error
        })
    })

};

/************************ Save Question and Options of KMS ************************* */
exports.saveQuestion = async (req, res) => {
    console.log("/saveQuestion")

    // console.log(req.body.data[0].options)
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
                start: data[i].start ? data[i].start : 0,
                files:data[i].files?data[i].files:[],
                linked:data[i].linked?data[i].linked:{}

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

};

/******************** Get Question By Next and Pre Action Id Id of KMS ************* */
exports.getQuestionById = async (req, res) => {
    console.log("/getQuestionById")

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
        console.log(error)
        res.status(400).send(error);
    }

};

/*********************** Get Question by Scenerio Action Id of KMS ****************** */
exports.getQuestionByScenerio = async (req, res) => {
    console.log("/getQuestionByScenerio")

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
        console.log(error)
        res.status(400).send(error);
    }

};

/************************ Get All Questions and Options of KMS ********************** */
exports.getQuestion = async (req, res) => {
    console.log("/getQuestion")

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
        console.log(error)
        res.status(400).send(err);
    }

};

/******************** Get All Scenerio Categories Action Id of KMS ****************** */
exports.getscenario = async (req, res) => {
    
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
        console.log(error)
        res.status(400).send(err);
    }

};


/******************** Get All Expired Scenerio Categories Action Id of KMS ****************** */
exports.getExpiredScenario = async (req, res) => {
    console.log("/getExpiredScenario")
    
    try {
        let desiredDate = new Date();
        console.log(desiredDate," <<<<<<<< current date")
        // Extract year, month, and day from the desired date
        let year = desiredDate.getFullYear();
        let month = ("0" + (desiredDate.getMonth() + 1)).slice(-2); // Adding 1 to month as it starts from 0
        let day = ("0" + desiredDate.getDate()).slice(-2);
        // Concatenate them in the desired format
        var formattedDate = year + "-" + month + "-" + day;
        console.log(formattedDate," <<<<<<<< formated date");
        const result = await scenario_details.find({ expDate :{ $lt :formattedDate } });   
        if (result) {
            console.log(result.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Expired Scenario Fetched Successfully",
                data: result
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(400).send(err);
    }

};

/************************ Get Items of Scenerio Action Id of KMS ********************* */
exports.getItemsScenerio = async (req, res) => {
    console.log("/getItemsScenerio")

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
        console.log(error)
        res.status(400).send(err);
    }

};

/************************ Edit Questions and Options of KMS *************************** */
exports.updateQuestion = async (req, res) => {
    console.log("/updateQuestion")

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
        console.log(error)
        res.status(400).send(error);
    }

};

/************************ Get Scenerio Details by Scenario Id of KMS ****************** */
exports.getscenarioDetails = async (req, res) => {
    console.log("/getscenarioDetails")

    const scenarioId = req.body.scenario_id ? req.body.scenario_id : ""

    try {
        const result = await scenario_details.find({ _id: ObjectId(scenarioId) });
        let responseDate1 = moment(result[0].liveDate).format("LLL");
        let responseDate2 = moment(result[0].expDate).format("LLL");
        const modifiedResult = {
            ...result[0]._doc,
            liveDate: responseDate1,
            expDate: responseDate2
        };
        let count = await scenario_details.updateOne({ "_id": ObjectId(scenarioId) }, 
            {   
                $set: { last_click_time: Date.now() },
                "$inc": { "count": 1 } 
            })
        if (result) {
            console.log(result.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Scenerio Details Fetched Successfully",
                data: [modifiedResult]
            })
        }
    }
    catch (error) {
        console.log(error,"errorerrorerror")
        res.status(400).send(error);
    }

};

/************************ Get Scenerio Details by Scenario Id of KMS ******************* */
exports.sceneraioDetails = (req, res) => {
    console.log("/sceneraioDetails")

    try {
        scenario_details.findOne({ _id: req.body.id }).then((data) => {
            res.status(201).json({
                error: false,
                code: 201,
                message: "Scenerio Details Fetched Successfully",
                data: data
            })
        })
    } catch (error) {
        console.log(error,"errorerrorerror")
        res.status(400).send(error);
    }
   
};

/************************ Increase Count by Scenario Id of KMS ************************* */
exports.updateSceneraioCount = (req, res) => {
    console.log("/updateSceneraioCount")

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
        console.log(error)
        res.status(400).send(error);
    }

};

/************************ Get Users based on user role of KMS ************************** */
exports.getUsersBasedOnUserRole = async (req, res) => {
    console.log("/getUsersBasedOnUserRole")

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
        console.log(error)
        res.status(400).send(error);
    }

};

/************************ Get Users based on Admin Id of KMS *************************** */
exports.getAgentBasedOnAdminId = async (req, res) => {
    console.log("/getAgentBasedOnAdminId")

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
        console.log(error)
        res.status(400).send(error);
    }

};

/************************ Get All Ranking wise Scenerio of KMS ************************** */
exports.getscenarioRankingWise = async (req, res) => {
    console.log("/getscenarioRankingWise")

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
        console.log(error)
        res.status(400).send(error);
    }

};

/************************ Get most view Scenerio Details Id of KMS ********************** */
exports.getMostViewSceneraioDetails = (req, res) => {
    console.log("/getMostViewSceneraioDetails")

    scenario_details.find({}, { count: 1, scenario: 1, actionId: 1, circle: 1 })
        .sort({ count: -1 }) // Sort in descending order based on the count field
        // .limit(6)
        .then((data) => {
            res.status(201).json({
                error: false,
                code: 201,
                message: "Scenario Details Fetched Successfully",
                data: data
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({
                error: true,
                code: 500,
                message: "Internal Server Error",
                data: error.message
            });
        });
};

/************************ update User And Scenario For Time Spent ********************** */

exports.updateUserAndScenarioForTimeSpent = async (req, res) => {
    console.log("updateUserAndScenarioForTimeSpent");

    try {
        const scenarioId = req.body.scenario_id || "";
        const userId = req.body.user_id || "";
        const timeSpent = parseInt(req.body.time_spent) || 0;

        if (!scenarioId || !userId) {
            throw new Error('Scenario ID and User ID must be provided');
        }

        const scenarioDetails = await scenario_details.findOne(
            { _id: ObjectId(scenarioId) }, 
            { scenario: 1, _id: 0 }
        );

        if (!scenarioDetails) {
            throw new Error('Scenario not found');
        }

        const registrationUpdate = await Registration.findOneAndUpdate(
            {
                _id: ObjectId(userId),
                'time_spent.scenario_id': ObjectId(scenarioId)
            },
            {
                $inc: { 'time_spent.$.time': timeSpent },
                $set: {
                    'time_spent.$.last_click_time': Date.now(),
                    'time_spent.$.scenario_name': scenarioDetails.scenario,
                    modified: Date.now()
                }
            },
            { new: true }
        );

        if (!registrationUpdate) {
            await Registration.updateOne(
                { _id: ObjectId(userId) },
                {
                    $push: {
                        time_spent: {
                            scenario_id: ObjectId(scenarioId),
                            scenario_name: scenarioDetails.scenario,
                            time: timeSpent,
                            last_click_time: Date.now()
                        }
                    },
                    $set: { modified: Date.now() }
                }
            );
        }

        const scenarioUpdate = await scenario_details.findOneAndUpdate(
            {
                _id: ObjectId(scenarioId),
                'time_spent.user_id': ObjectId(userId)
            },
            { 
                $inc: { 'time_spent.$.time': timeSpent },
                $set: { modified: Date.now() }
            },
            { new: true }
        );

        if (!scenarioUpdate) {
            await scenario_details.updateOne(
                { _id: ObjectId(scenarioId) },
                {
                    $push: {
                        time_spent: {
                            user_id: ObjectId(userId),
                            time: timeSpent
                        }
                    },
                    $set: { modified: Date.now() }
                }
            );
        }

        res.status(200).json({
            error: false,
            code: 200,
            message: "Time Updated Successfully",
            data: []
        });

    } catch (error) {
        console.error("Error updating time spent:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: error.message,
            data: []
        });
    }
};


/************************ Get Users details with time spent of KMS ********************** */
exports.getUsersDetailsWithTimespent = async (req, res) => {
    console.log("/getUsersDetailsWithTimespent");

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
};

/*********************** Get scenario details with time spent of KMS ******************** */
exports.getScenarioDetailsWithTimespent = async (req, res) => {
    console.log("/getScenarioDetailsWithTimespent");

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
};

/************** Get Scenerio Details based on Category and AdminId of KMS *************** */
exports.getScenarioBasedOnCatnAdm = (req, res) => {
    console.log("/getScenarioBasedOnCatnAdm")

    let category = req.body.category ? req.body.category : ""
    let admin_id = req.body.admin_id ? req.body.admin_id : ""
    scenario_details.find({ admin_id: admin_id, category: category }).then((data) => {
        res.status(201).json({
            error: false,
            code: 201,
            message: "Scenario Details Fetched Successfully",
            data: data,
        });
    }).catch((error) => {
        console.error(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal Server Error",
            data: error.message
        });
    });
};

/***************************************** Save Logs of KMS ***************************** */
exports.logs =  async (req, res) => {
    console.log("/logs")

    let scenario_id = req.body.scenario_id ? req.body.scenario_id : ""
    let user_id = req.body.user_id ? req.body.user_id : ""
    let log = req.body.log ? req.body.log : []

    let saveData = {
        scenario_id:scenario_id,
        user_id:user_id,
        log:log
    }
    const logsData = await new logs(saveData);
    logsData.save().then((question) => {
        res.status(201).json({
            error: false,
            code: 201,
            message: "Logs save Successfully",
            data: question
        })
        console.log('save');
    }).catch((error) => {
        console.log(error)
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error
        })
    })

};

/************************************ update Logs of KMS ******************************** */
exports.updateLogs = async (req, res) => {
    console.log("/updateLogs");

    try {
        const log_id = req.body.log_id;
        const step_id = req.body.step_id 
        const time_spent = req.body.time_spent;

        const result = await logs.updateOne(
            { "_id": ObjectId(log_id) },
            {  
                $set: {
                    time_spent: time_spent
                },
                $push: {
                    log: ObjectId(step_id)
                }
            }
        );

        res.status(201).json({
            error: false,
            code: 201,
            message: "Update Log Successfully",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal Server Error"
        });
    }
};



/************** Get Agent Details based  AgentId of KMS *************** */
exports.getAgentDetailsOfAdmin = (req, res) => {
    console.log("/getAgentDetailsOfAdmin")

    let agent_id = req.body.agent_id ? req.body.agent_id : ""
    Registration.findOne({ _id: ObjectId(agent_id) }).then(async(data) => {
       let adminName = await Registration.findOne({ _id: ObjectId(data.admin_id)},{name:1,_id:0})
       const modifiedResult = {
        ...data._doc,
        admin_name: adminName.name,
    };
       data["admin_name"] = adminName.name
        res.status(200).json({
            error: false,
            code: 200,
            message: "Agent Details Fetched Successfully",
            data: modifiedResult,
        });
    }).catch((error) => {
        console.error(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal Server Error",
            data: error.message
        });
    });
};

exports.getAgentDetailsBasedOnAgentId = async (req, res) => {
    console.log("/getAgentDetailsBasedOnAgentId");

    let agent_id = req.body.agent_id ? req.body.agent_id : "";

    try {
        let result;

        // Try to fetch scenario details
        result = await Registration.aggregate([
            {
                "$match": { "_id": ObjectId(agent_id) }
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
                "$unwind": "$scenario_details"
            },
            {
                "$sort": {
                    "scenario_details.count": -1 // Sort in descending order based on count
                }
            },
            {
                "$group": {
                    "_id": "$_id",
                    "profile_image": { "$first": "$profile_image" },
                    "name": { "$first": "$name" },
                    "mobile_number": { "$first": "$mobile_number" },
                    "email": { "$first": "$email" },
                    "user_role": { "$first": "$user_role" },
                    "admin_id": { "$first": "$admin_id" },
                    "is_deleted": { "$first": "$is_deleted" },
                    "time_spent": { "$first": "$time_spent" },
                    "scenario_details": { "$push": "$scenario_details" }
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
                        "last_click_time":1,
                        "time_spent": 1,
                    },
                }
            },
            {
                "$sort": {
                    "scenario_details.time_spent": -1 // Sort in descending order based on time_spent
                }
            }
        ]);

        // If scenario details are found, return them
        if (result.length > 0) {
            let admin_name = await Registration.findOne({_id:ObjectId(result[0].admin_id)},{name :1})
            result[0]['admin_name']=admin_name
            res.status(200).json({
                error: false,
                code: 200,
                message: "Successfully",
                data: result[0], // Assuming you want a single scenario's details
            });
        } else {
            // If scenario details are not found, fetch agent details
            result = await Registration.aggregate([
                {
                    "$match": { "_id": ObjectId(agent_id) }
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
                        "scenario_details": { "$literal": [] } // Empty array for scenario_details
                    }
                }
            ]);

            if (result.length > 0) {
                let admin_name = await Registration.findOne({_id:ObjectId(result[0].admin_id)},{name :1})
                result[0]['admin_name']=admin_name
                res.status(200).json({
                    error: false,
                    code: 200,
                    message: "Successfully",
                    data: result[0],
                });
            } else {
                res.status(404).json({
                    error: true,
                    code: 404,
                    message: "Agent not found",
                    data: []
                });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal Server Error",
            data: error.message
        });
    }
};


/************** Get Agent logs Details based on user_id & scenario_id*************** */
exports.getAgentLogsDetails = async(req, res) => {
    console.log("/getAgentLogsDetails")

    try {
        const user_id = req.body.user_id;
        const scenario_id = req.body.scenario_id;
        let DATE_STRING_DATE_TIME_FORMAT = "%d/%m/%Y, %H:%M:%S";
        let DEFAULT_TIME_ZONE = "Asia/Kolkata";

        if (!user_id || !scenario_id) {
            return res.status(400).json({
                error: true,
                code: 400,
                message: "user id and scenario id are required fields"
            });
        }

        let logResult = await logs.aggregate([
            {
                "$match": { "user_id": ObjectId(user_id),"scenario_id": ObjectId(scenario_id) }
            },
            {
                "$lookup": {
                    "from": "questions",
                    "localField": "log",
                    "foreignField": "_id",
                    "as": "questions_details"
                }
            },
            {
                "$unwind": "$questions_details"
            },
            {
                "$group": {
                    "_id": "$_id",
                    "scenario_id": { "$first": "$scenario_id" },
                    "user_id": { "$first": "$user_id" },
                    "is_comleted": { "$first": "$is_comleted" },
                    "created": { "$first": "$created" },
                    "modified": { "$first": "$modified" },
                    "time_spent": { "$first": "$time_spent" },
                    "questions_details": { "$push": "$questions_details" }
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "scenario_id":1,
                    "user_id":1,
                    "is_comleted":1,
                    "time_spent" : 1,
                    "created":{ $dateToString: { format: DATE_STRING_DATE_TIME_FORMAT,timezone: DEFAULT_TIME_ZONE,  date: "$created" } },
                    "modified":{ $dateToString: { format: DATE_STRING_DATE_TIME_FORMAT,timezone: DEFAULT_TIME_ZONE,  date: "$modified" } },
                    // "log":1,
                    "questions_details":{
                        
                        "question":1,
                        "options":1,
                        "tables":1,
                        "file":1,

                    }
                   
                }
            },
        ])
        if(logResult){
            res.status(201).json({
                error: false,
                code: 201,
                message: "Update Log Successfully",
                data: logResult
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal Server Error"
        });
    }
};
const fetch = require('node-fetch');
// Replace 'API_ENDPOINT' with the actual URL of the API
const API_ENDPOINT = 'https://example.com/api/software';

exports.getSoftwareNames = async (req, res) => {
    try {
        const response = await fetch(API_ENDPOINT);
        console.log(response,"zzzzzzzzzzzzzzzzzzzzz")
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const contentType = response.headers.get('Content-Type');
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Invalid content type: ${contentType}`);
        }
        
        const data = await response.json();        
        console.log(data,"aaaaaaaaaaaaaaaaaaa")

        // Assuming the API response is an array of software objects with a 'name' property
        const softwareNames = data.map(software => software.name);
        console.log(softwareNames,"xxxxxxxxxxxxxxxxxxxxxx")

        res.status(200).json({
            error: false,
            code: 200,
            message: "Successfully",
            data: softwareNames, // Assuming you want a single scenario's details
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal Server Error",
            data: error.message
        });
    }
};


/************************ Delete Qestions and Options bye Scene Id of KMS **************** */
// exports.deleteSceine = async (req, res) => {
    //          console.log("http://localhost:2222/deleteSceine")
    
    //     let id = req.body.id
    //     // const deleteData = await Question.deleteMany({scene:id})
    //     if (deleteData) {
    //         res.status(201).send(deleteData);
    //     }
// };
