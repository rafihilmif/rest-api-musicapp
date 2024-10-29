const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const multer = require("multer");
const path = require("path");
const fs = require('fs').promises;
const { func } = require("joi");
const Joi = require("joi");
const router = express.Router();

//gjRiscVOGx6CvYlpa67P9Cam2T4
router.post("/admin/auth/login", async function (req, res) {
    const { email, password } = req.body;

    try {
        if (email === "admin@musickvlt.site" && password == "gjRiscVOGx6CvYlpa67P9Cam2T4") {
            return res.status(200).json({message:"Successfully login as admin"});
        }
        else {
            return res.status(400).json("Failed login as admin");
        }
    } catch (error) {
         return res.status(400).json("Failed login ", error);
    }
});

module.exports = router;