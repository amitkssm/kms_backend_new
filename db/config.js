const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
// let url = "mongodb+srv://tolet:tolet@cluster0.nlbdxil.mongodb.net/kms_db?retryWrites=true&w=majority"
// let url = "mongodb+srv://akssmbr91:CqGu8uIfp2Hhs4hC@cluster0.mtbcggb.mongodb.net/kms_db?retryWrites=true&w=majority"
let url = "mongodb+srv://amitkssm91:EQyEkdMq2UmkLSgI@cluster0.zkm5wey.mongodb.net/kms_demo"
// let url = "mongodb://localhost:27017/kms_db"
mongoose.connect(url,
{useNewUrlParser : true},(err,result)=>{
    if(err){
        console.log("not Connected",err)
    }else{
    console.log("db Connected")
    }

});


// app.post("/updateUserAndScenarioForTimeSpent", (req, res) => {
//     console.log("http://localhost:2222/updateUserAndScenarioForTimeSpent");

//     try {
//         const scenarioId = req.body.scenario_id ? req.body.scenario_id : "";
//         const user_id = req.body.user_id ? req.body.user_id : "";
//         const time_spent = req.body.time_spent ? parseInt(req.body.time_spent) : 0; // Convert time_spent to integer

//         // Check if the scenario_id already exists in the array
//         Registration.findOneAndUpdate(
//             { "_id": ObjectId(user_id), "time_spent.scenario_id": ObjectId(scenarioId) },
//             { $inc: { "time_spent.$.time": time_spent } },
//             { new: true }
//         ).then((registrationData) => {
//             if (!registrationData) {
//                 // If the scenario_id doesn't exist, add a new entry
//                 Registration.updateOne(
//                     { "_id": ObjectId(user_id) },
//                     { $push: { time_spent: { scenario_id: ObjectId(scenarioId), time: time_spent } } }
//                 ).then(() => {
//                     scenario_details.updateOne(
//                         { "_id": ObjectId(scenarioId) },
//                         { $push: { time_spent: { user_id: ObjectId(user_id), time: time_spent } } }
//                     ).then(() => {
//                         res.status(200).json({
//                             error: false,
//                             code: 200,
//                             message: "Time Updated Successfully",
//                             data: []
//                         });
//                     });
//                 });
//             } else {
//                 // If the scenario_id exists, update the time in the existing entry
//                 scenario_details.updateOne(
//                     { "_id": ObjectId(scenarioId), "time_spent.user_id": ObjectId(user_id) },
//                     { $inc: { "time_spent.$.time": time_spent } }
//                 ).then(() => {
//                     res.status(200).json({
//                         error: false,
//                         code: 200,
//                         message: "Time Updated Successfully",
//                         data: []
//                     });
//                 });
//             }
//         });
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });




// app.post("/updateUserAndScenarioForTimeSpent", (req, res) => {
//     console.log("http://localhost:2222/updateUserAndScenarioForTimeSpent");

//     try {
//         const scenarioId = req.body.scenario_id ? req.body.scenario_id : "";
//         const user_id = req.body.user_id ? req.body.user_id : "";
//         const time_spent = req.body.time_spent ? parseInt(req.body.time_spent) : 0; // Convert time_spent to integer

//         // Update Registration table
//         Registration.findOneAndUpdate(
//             {
//                 "_id": ObjectId(user_id),
//                 "time_spent.scenario_id": ObjectId(scenarioId)
//             },
//             { $inc: { "time_spent.$.time": time_spent } },
//             { new: true }
//         ).then((registrationData) => {
//             if (!registrationData) {
//                 // If the combination doesn't exist, add a new entry in the Registration table
//                 Registration.updateOne(
//                     { "_id": ObjectId(user_id) },
//                     { $push: { time_spent: { scenario_id: ObjectId(scenarioId), time: time_spent } } }
//                 ).then(() => {
//                     res.status(200).json({
//                         error: false,
//                         code: 200,
//                         message: "Time Updated Successfully",
//                         data: []
//                     });
//                 });
//             } else {
//                 // If the combination exists, update the time in the existing entry in the Registration table
//                 res.status(200).json({
//                     error: false,
//                     code: 200,
//                     message: "Time Updated Successfully",
//                     data: []
//                 });
//             }
//         });

//         // Update scenario_details table
//         scenario_details.findOneAndUpdate(
//             {
//                 "_id": ObjectId(scenarioId),
//                 "time_spent.user_id": ObjectId(user_id)
//             },
//             { $inc: { "time_spent.$.time": time_spent } },
//             { new: true }
//         ).then((scenarioDetailsData) => {
//             if (!scenarioDetailsData) {
//                 // If the combination doesn't exist, add a new entry in the scenario_details table
//                 scenario_details.updateOne(
//                     { "_id": ObjectId(scenarioId) },
//                     { $push: { time_spent: { user_id: ObjectId(user_id), time: time_spent } } }
//                 ).then(() => {
//                     res.status(200).json({
//                         error: false,
//                         code: 200,
//                         message: "Time Updated Successfully",
//                         data: []
//                     });
//                 });
//             } else {
//                 // If the combination exists, update the time in the existing entry in the scenario_details table
//                 res.status(200).json({
//                     error: false,
//                     code: 200,
//                     message: "Time Updated Successfully",
//                     data: []
//                 });
//             }
//         });
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });
