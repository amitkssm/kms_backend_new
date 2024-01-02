
 
const express = require("express");
const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;
const cors = require("cors");

// var validator = require('gstin-validator');


require("./db/config");

const { Question, scenario_details, } = require("./db/question")


const app = express();
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send("home page");
})

app.listen((2222), () => {
    console.log("app is running on port 2222")
})

//==================================== KMS API START =====================================//

app.post('/saveScenario', async (req, res) => {
 
    const question = await new scenario_details(req.body);
    question.save().then((question) => {
        res.status(201).send(question);
        console.log('save');
    }).catch((error) => {
        res.status(400).send(error);
    })
    
})

app.post("/saveQuestion",async (req, res) => {
    console.log(req.body.data[0].options)
    let count=0
    let data=req.body.data
let savedQuestion
    try {
        for(let i=0;i<data.length;i++)
        { let question = data[i].question ? data[i].question : ""
        let options = data[i].options ? data[i].options : []
        let tables = data[i].tables ? data[i].tables : []
        let pre = data[i].pre ? data[i].pre : ""
        let scene=req.body.scene

        let saveData = {
            
            question: question,
            pre:pre,
            options: options,
            tables: tables,
            scene:scene

        }
        console.log(saveData)
        Question.create(saveData).then((result)=>{
            if(i==0){
               savedQuestion=result
            }

        if (result) {
            count++
           if(count==data.length){ 
            console.log("s")
            scenario_details.updateOne({_id:scene},{$set:{actionId:result._id}}).then((data)=>{
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
 

app.post('/getQuestionById', async (req, res) => {
    try {
        const actionId = req.body.actionId ? req.body.actionId : null
        const question = await Question.find({ pre:actionId});
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

app.post('/getQuestionByScenerio', async (req, res) => {
    try {
        const actionId = req.body.actionId ? req.body.actionId : null
        const question = await Question.find({ _id:actionId});
        
        if (question) {
            console.log(question.length);
            res.status(201).send(question);
        } 
    }
    catch (error) {
        res.status(400).send(error);
    }

});



app.get('/getQuestion',async(req,res)=>{

    //const questions = req.params.question ? req.params.question : "" 
    try {
        const result = await Question.find({} ,{created_date:0, __v:0 });
        if (result) {
            console.log(result.length);
            res.status(201).send(result);
        } 
    }
    catch (error) {
        res.status(400).send(err);
    }

});


app.get('/getscenario',async(req,res)=>{

    //const questions = req.params.question ? req.params.question : "" 
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



app.post('/getItemsScenerio',async(req,res)=>{

    const scene = req.body.scene ? req.body.scene : "" 
    try {
        const result = await Question.find({scene:scene});
        if (result) {
            console.log(result.length);
            res.status(201).send(result);
        } 
    }
    catch (error) {
        res.status(400).send(err);
    }

});
app.post('/updateQuestion',async(req,res)=>{
    
    try {
        let data = req.body.data ? req.body.data :[]
        let result

        for(i=0;i<data.length;i++){
            let id= data[i]._id
            delete data[i]._id
            result = await Question.updateOne({_id:ObjectId(id)},{$set:data[i]},{new: true});
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












