const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Plan = require("../../models/Plan");

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
router.post('/admin/plan/add', async function (req, res) {
    let { name, duration, desc, price } = req.body;

    let newIdPrefix = "PLN";
    let keyword = `%${newIdPrefix}%`
    let similiarUID = await Plan.findAll({
        where: {
            id_plan: {
                [Op.like]: keyword
            }
        }
    });

    let newIdPlan = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');
    const newPlan = await Plan.create({
        id_plan: newIdPlan,
        name: name,
        duration: duration,
        description: desc,
        price: price,
        created_at: Date.now(),
    });
    return res.status(201).send({ message: "plan " + name + " berhasil ditambahkan" });
});

router.get('/admin/plan', async function (req, res) {
    const { page, pageSize } = req.query;
    const limit = pageSize || 3;
    const offset = (page - 1) * limit || 0;

    try {
        const {rows, count} = await Plan.findAndCountAll({
            limit,
            offset,
             order: [
                [Sequelize.literal(`id_plan`), 'ASC'],
            ],
        });
        return res.status(200).json({
        data: rows,
        total: count
    });
    } catch (err) {
        return res.status(400).send('gagal memuat data');
    }
});
module.exports = router;