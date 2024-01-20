const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;

const registrationSchema = new mongoose.Schema({
    profile_image: String,
    name: String,
    mobile_number: String,
    email: String,
    password: String,
    address: String,
    user_role: String,
    admin_id: String,
    // time_spent: Number,
    time_spent: [
        {
            scenario_id:ObjectId,
            time:Number
        } 
    ],
    is_deleted: { type: Number, default: 0 },
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now }

});
Registration = mongoose.model("registrations", registrationSchema);

const questionSchema = new mongoose.Schema({
    // scenario: String,
    question: String,
    pre: String,
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
    scene: String,
    newData: { default: 1, type: Number },
    start: { type: Number, default: 0 },

    created_date: {
        type: Date,
        default: Date.now
    }

});
Question = mongoose.model("Questions", questionSchema);

const scenarioSchema = new mongoose.Schema({

    scenario: String,
    circle: String,
    liveDate: String,
    expDate: String,
    brief: String,
    actionId: String,
    admin_id:String,
    time_spent: [
       {
        user_id:ObjectId,
        time:Number
       } 
    ],
    count: { type: Number, default: 0 },
    
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now }

});
scenario_details = mongoose.model("scenario_details", scenarioSchema);


module.exports = {
    
    Registration,
    Question,
    scenario_details,

}