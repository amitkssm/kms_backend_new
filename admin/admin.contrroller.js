const fs = require('fs')
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const multer = require('multer');

const secretKey = 'kms-ak-node';
const handler = require('./admin.handler')

const { Registration, Section, Partner, Query} = require("../schema/schema")



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
            res.status(201).json({
                error: true,
                code: 201,
                message: "User not found.",
            })
        }
        else {
            const token = jwt.sign({ email }, secretKey);
            const isMatch = await handler.decryptPassword(password1, user.password)
            if (isMatch) {
                res.status(200).json({
                    error: false,
                    code: 200,
                    message: "User Logged In",
                    result: user,
                    token: token
                })
            }
            else {
                return res.status(201).send({
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
    try {
        // let profile_image = req.files["profile_image"] ? req.files["profile_image"][0].filename : "";
        let { name, mobile_number, email, password, user_role, admin_id, category } = req.body;
        let bPassword = await handler.bcryptPassword(password);


        let existingUser = await Registration.findOne({ mobile_number });
        if (existingUser) {
            return res.status(400).json({ error: true, message: "Mobile number already exists" });
        }

        let newUser = new Registration({
            // profile_image,
            name,
            mobile_number,
            email: email.toLowerCase().trim(),
            password: bPassword,
            user_role,
            admin_id,
            category,
        });

        let result = await newUser.save();
        res.status(200).json({ error: false, message: "Registered Successfully", data: result });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Update User
exports.UpdateUser = async (req, res) => {
    console.log("saasasasasassasasasaas")
    try {
        let profile_image = req.files["profile_image"] ? req.files["profile_image"][0].filename : null;
        let { userId, name, mobile_number, email, user_role, admin_id, category,password } = req.body;

        let updateData = { name, mobile_number, email, user_role, admin_id, category ,password};
        if (profile_image) updateData.profile_image = profile_image;

        let updatedUser = await Registration.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ error: true, message: "User not found" });

        res.status(200).json({ error: false, message: "User updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Delete User
exports.DeleteUser = async (req, res) => {
    try {
        let { userId } = req.body;
        let deletedUser = await Registration.findByIdAndDelete(userId);
        if (!deletedUser) return res.status(404).json({ error: true, message: "User not found" });

        res.status(200).json({ error: false, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Get User by ID
exports.GetUserById = async (req, res) => {
    try {
        let { userId } = req.body;
        let user = await Registration.findById(userId);
        if (!user) return res.status(404).json({ error: true, message: "User not found" });

        res.status(200).json({ error: false, message: "User retrieved successfully", data: user });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Get All Users
exports.GetAllUsers = async (req, res) => {
    try {
        let users = await Registration.find();
        res.status(200).json({ error: false, message: "Users retrieved successfully", data: users });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Get Users by Role
exports.GetUsersByRole = async (req, res) => {
    try {
        let { role } = req.body;
        let users = await Registration.find({ user_role: role });
        res.status(200).json({ error: false, message: "Users retrieved successfully", data: users });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/************************************* EDDU GURU ************************************ */


exports.saveSection = async (req, res) => {
    try {
        const { section_name, button_label = "", button_route = "" } = req.body;

        if (!section_name) {
            return res.status(400).json({ error: true, message: "Section name is required" });
        }

        // Extract file paths
        const profile_image = req.files["profile_image"] ? req.files["profile_image"][0].path : null;
        const cover_image = req.files["cover_image"] ? req.files["cover_image"][0].path : null;
        const image = req.files["image"] ? req.files["image"][0].path : null;

        // Parse `details` array from form-data
        let details = req.body.details ? JSON.parse(req.body.details) : [];

        // Ensure that details array length matches uploaded files count
        if (!Array.isArray(details)) {
            return res.status(400).json({ error: true, message: "Invalid details format" });
        }

        // Attach uploaded `icon` and `image` to the respective detail entry
        let icons = req.files["details_icon"] || [];
        let images = req.files["details_image"] || [];

        details = details.map((detail, index) => ({
            ...detail,
            icon: icons[index] ? icons[index].path : "",  // Assign the correct icon file
            image: images[index] ? images[index].path : "" // Assign the correct image file
        }));

        // **Check if section exists (Update or Save)**
        let section = await Section.findOne({ section_name });

        if (section) {
            // **Update existing section**
            section.title = req.body.title || section.title;
            section.heading = req.body.heading || section.heading;
            section.details = details.length > 0 ? details : section.details;
            section.profile_image = profile_image || section.profile_image;
            section.cover_image = cover_image || section.cover_image;
            section.image = image || section.image;
            section.button_route = req.body.button_route || section.button_route;
            section.button_label = req.body.button_label || section.button_label;
          

            await section.save();

            return res.status(200).json({
                error: false,
                message: "Section updated successfully",
                data: section
            });
        }

        // **Create new section**
        const newSection = new Section({
            section_name,
            title: req.body.title,
            heading: req.body.heading,
            details,
            profile_image,
            cover_image,
            image,
            button_route,
            button_label
        });

        await newSection.save();

        res.status(201).json({
            error: false,
            message: "Section saved successfully",
            data: newSection
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Error saving section", data: error });
    }
};

// partner

exports.savePartner = async (req, res) => {
    try {
        const { partner_name } = req.body;
        // Extract file paths
        const partner_logo = req.files["partner_logo"] ? req.files["partner_logo"][0].path : null;

        const newPartner = new Partner({ partner_name, partner_logo });
        await newPartner.save();

        res.status(201).json({ message: 'Partner added successfully', data: newPartner });
    } catch (error) {
        res.status(500).json({ message: 'Error adding partner', error });
    }
};

exports.getAllPartner = async (req, res) => {
    try {
        const partners = await Partner.find();
        res.status(200).json({ message: "Partners retrieved successfully", data: partners });
    } catch (error) {
        res.status(500).json({ message: "Error fetching partners", error });
    }
};

exports.getPartnerById = async (req, res) => {
    try {
        const { partner_id } = req.body;
        const partner = await Partner.findById(partner_id);

        if (!partner) return res.status(404).json({ message: "Partner not found" });

        res.status(200).json({ message: "Partner retrieved successfully", data: partner });
    } catch (error) {
        res.status(500).json({ message: "Error fetching partner", error });
    }
};

exports.updatePartner = async (req, res) => {
    try {
        const { partner_id, partner_name } = req.body;
        const partner_logo = req.files["partner_logo"] ? req.files["partner_logo"][0].path : null;

        const updatedPartner = await Partner.findByIdAndUpdate(
            partner_id,
            { partner_name, partner_logo },
            { new: true }
        );

        if (!updatedPartner) return res.status(404).json({ message: "Partner not found" });

        res.status(200).json({ message: "Partner updated successfully", data: updatedPartner });
    } catch (error) {
        res.status(500).json({ message: "Error updating partner", error });
    }
};

exports.deletePartner = async (req, res) => {
    try {
        const { partner_id } = req.body;

        const deletedPartner = await Partner.findByIdAndDelete(partner_id);
        if (!deletedPartner) return res.status(404).json({ message: "Partner not found" });

        res.status(200).json({ message: "Partner deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting partner", error });
    }
};

//queries

exports.saveQuery = async (req, res) => {
    try {
        const { name, phone_number, subject } = req.body;

        if (!name || !phone_number || !subject) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newQuery = new Query({ name, phone_number, subject });
        await newQuery.save();

        res.status(201).json({ message: "Query added successfully", data: newQuery });
    } catch (error) {
        res.status(500).json({ message: "Error adding query", error });
    }
};

exports.getAllQueries = async (req, res) => {
    try {
        const queries = await Query.find();
        res.status(200).json({ message: "Queries retrieved successfully", data: queries });
    } catch (error) {
        res.status(500).json({ message: "Error fetching queries", error });
    }
};

exports.getQueryById = async (req, res) => {
    try {
        const { query_id } = req.body;
        const query = await Query.findById(query_id);

        if (!query) return res.status(404).json({ message: "Query not found" });

        res.status(200).json({ message: "Query retrieved successfully", data: query });
    } catch (error) {
        res.status(500).json({ message: "Error fetching query", error });
    }
};

exports.updateQuery = async (req, res) => {
    try {
        const { query_id, name, phone_number, subject } = req.body;

        const updatedQuery = await Query.findByIdAndUpdate(
            query_id,
            { name, phone_number, subject },
            { new: true }
        );

        if (!updatedQuery) return res.status(404).json({ message: "Query not found" });

        res.status(200).json({ message: "Query updated successfully", data: updatedQuery });
    } catch (error) {
        res.status(500).json({ message: "Error updating query", error });
    }
};

exports.deleteQuery = async (req, res) => {
    try {
        const { query_id } = req.body;

        const deletedQuery = await Query.findByIdAndDelete(query_id);
        if (!deletedQuery) return res.status(404).json({ message: "Query not found" });

        res.status(200).json({ message: "Query deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting query", error });
    }
};













