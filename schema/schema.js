const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;


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
    files: [],
    linked: {},
    scene: String,
    newData: { default: 1, type: Number },
    start: { type: Number, default: 0 },

    created_date: {
        type: Date,
        default: Date.now
    },

    is_final: { type: Number, default: 0 },
    type: String

});
const Question = mongoose.model("Questions", questionSchema);

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
    is_deleted: { type: Number, default: 0 },
    status: { type: Number, default: 1 }
}, 
{ timestamps: true   });
const Registration = mongoose.model("users", registrationSchema);


/**************************** Schema For EDU GURU ****************************** */

const detailSchema = new mongoose.Schema({
    icon: String,
    image: String,
    heading: String,
    subheading: String,
    description: String,
    button_route: String,
    button_label: String,
    skill_name: String,
    rating_value: Number,
    name: String,
    designation: String,
    twitter_link: String,
    linkedin_link: String,
    button_link: String,
    title: String,
    note: String,
    rating: Number
}, { _id: false });

const sectionSchema = new mongoose.Schema({
    section_name: { type: String, required: true, unique: true }, // e.g., "main_banner", "what_we_are"
    title: String,
    subtitle: String,
    heading: String,
    subheading: String,
    description: String,
    profile_image: String,
    cover_image: String,
    image: String,
    button_route: String,
    button_label: String,
    details: [detailSchema] // Used for sections having multiple details

}, { timestamps: true });

const Section = mongoose.model("Section", sectionSchema);

const PartnerSchema = new mongoose.Schema({
    partner_name: { type: String, required: true },
    partner_logo: { type: String, required: true }
}, { timestamps: true });

const Partner = mongoose.model('Partner', PartnerSchema);

const QuerySchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone_number: { type: String, required: true },
    subject: { type: String, required: true }
}, { timestamps: true });

const Query = mongoose.model("Query", QuerySchema);




module.exports = {

    Registration,
    Question,

    // eduguru

    Section,
    Partner,
    Query
   



}