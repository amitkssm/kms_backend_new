const express = require("express");
const router = express.Router();
const adminController = require("./admin.contrroller");
const adminHandler = require("./admin.handler");
const multer = require('multer');


router.post("/login", adminHandler.upload, adminController.login)
router.post("/registration", adminController.Registration);
router.post("/UpdateUser", adminHandler.upload, adminController.UpdateUser);
router.post("/GetAllUsers", adminController.GetAllUsers);
router.post("/GetUserById", adminController.GetUserById);
router.post("/DeleteUser", adminController.DeleteUser);

// landing page section 

router.post("/saveSection", adminHandler.upload, adminController.saveSection)
//partner
router.post("/savePartner", adminHandler.upload, adminController.savePartner)
router.post("/getAllPartner", adminController.getAllPartner)
router.post("/getPartnerById", adminController.getPartnerById)
router.post("/updatePartner", adminHandler.upload, adminController.updatePartner)
router.post("/deletePartner", adminController.deletePartner)
//query
router.post("/saveQuery", adminController.saveQuery)
router.post("/getAllQueries", adminController.getAllQueries)
router.post("/getQueryById", adminController.getQueryById)
router.post("/updateQuery", adminController.updateQuery)
router.post("/deleteQuery", adminController.deleteQuery)





module.exports = router;