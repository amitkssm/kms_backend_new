const express = require("express");
const router = express.Router();
const frountUserController = require("./api.contrroller");
const frountUserHandler = require("./api.handler");
const multer = require('multer');


// router.post("/login", frountUserHandler.upload, frountUserController.login)

router.post("/saveQuestion", frountUserController.saveQuestion);
router.post("/getQuestionById", frountUserController.getQuestionById);





module.exports = router;