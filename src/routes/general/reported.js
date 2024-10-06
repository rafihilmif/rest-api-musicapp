const { response } = require("express");
const express = require("express");
const { Op, Sequelize} = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const { func } = require("joi");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Reported = require("../../models/Reported");

const router = express.Router();

router.post('/reported', async function (req, res) {
    const { idUser, idArtist } = req.query;
    const { category, comment } = req.body;

    try {
        let newIdPrefix = "RPRTD";
        let keyword = `%${newIdPrefix}%`;
        let similiarUID = await Reported.findAll({
            where: {
                id_report: {
                    [Op.like]: keyword,
                },
            },
        });
    let newIdReport = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
     const data = await Reported.create({
            id_report: newIdReport,
            id_user: idUser,
            id_artist: idArtist,
            category: category,
            comment: comment,
            created_at: Date.now(),
        });
        return res.status(200).json({
            message: "Report has been recorded by user" + idUser + " to artist " + idArtist,
            data: data
        });
    } catch (error) {
         console.error('Error submit reported:', error);
    }
});
module.exports = router;