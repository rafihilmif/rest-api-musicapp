
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Shows = require("../../models/Shows");

const router = express.Router();

router.get('/shows', async function (req, res) {
    try {
        const data = await Shows.findAll();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).send('gagal memuat data show');
    }
});
router.get('/detail/show', async function (req, res) {
    const { id } = req.query;
    try {
        const data = await Shows.findOne({
            where: {
                id_show: {
                    [Op.like]: id
                }
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).send('gagal memuat detail show');
    }
});
module.exports = router;