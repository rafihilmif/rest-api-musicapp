const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const multer = require("multer");
const path = require("path");
const fs = require('fs').promises;
const { func } = require("joi");
const Joi = require("joi");
const router = express.Router();
const jwt = require("jsonwebtoken");

//gjRiscVOGx6CvYlpa67P9Cam2T4
router.post("/admin/auth/login", async function (req, res) {
    const { email, password } = req.body;

    try {
        if (email === "admin@musickvlt.site" && password === "gjRiscVOGx6CvYlpa67P9Cam2T4") {
            const token = jwt.sign(
                {
                    id: "admin",
                    email: "admin@musickvlt.site",
                    role: 'admin'
                },
                process.env.JWT_KEY,
                { expiresIn: '30d' }
            );

            // Send user details along with the token
            return res.status(200).json({
                id: "admin",
                email: "admin@musickvlt.site",
                role: 'admin',
                token: token,
            });
        } else {
            return res.status(400).json("Failed login as admin");
        }
    } catch (error) {
        return res.status(400).json("Failed login", error);
    }
});


module.exports = router;