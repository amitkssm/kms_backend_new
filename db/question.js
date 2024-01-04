const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;
const questionSchema = new mongoose.Schema({
    // scenario: String,
    question: String,
    pre:String,
    options: {
        type: Array,
        default: [
            {
                option: String,
                next: String
            }
        ]
    },
    tables: [],
    scene:String,
    newData:{default:1,type:Number},
    start:{type:Number,default:0},

    created_date: {
        type: Date,
        default: Date.now
    }

});
Question = mongoose.model("Questions", questionSchema);

const scenarioSchema = new mongoose.Schema({

    scenario: String,
    circle:String,
    liveDate:String,
    expDate:String,
    brief:String,
    actionId: String,
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now }

});
scenario_details = mongoose.model("scenario_details", scenarioSchema);


module.exports = {
    Question,
    scenario_details,

}