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
    category: String,
    admin_id: String,
    // time_spent: Number,
    time_spent: [
        {
            scenario_id:ObjectId,
            scenario_name:String,
            time:Number,
            last_click_time:{ type: Date, default: Date.now }
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
    files:[],
    linked:{},
    scene: String,
    newData: { default: 1, type: Number },
    start: { type: Number, default: 0 },

    created_date: {
        type: Date,
        default: Date.now
    },

    is_final:{ type: Number, default: 0 },
    type:String

});
Question = mongoose.model("Questions", questionSchema);

const scenarioSchema = new mongoose.Schema({

    scenario: String,
    circle: String,
    category: String,
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
    type:String,
    device_type:String,
    last_click_time: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now }

});
scenario_details = mongoose.model("scenario_details", scenarioSchema);

const logsSchema = new mongoose.Schema({
    scenario_id: ObjectId,
    user_id: ObjectId,
    log: [ObjectId],
    time_spent : Number,
    is_comleted: { type: Number, default: 0 },
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now }

});
logs = mongoose.model("logs", logsSchema);

const emailOtpSchema = new mongoose.Schema({
    email: String,
    otp: Number,
    expire_in: String
})

var Email_otp = mongoose.model('email_otp', emailOtpSchema, 'email_otp')


module.exports = {
    
    Registration,
    Question,
    scenario_details,
    logs,
    Email_otp

}