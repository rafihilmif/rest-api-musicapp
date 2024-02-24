const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Category = require("../../models/Category");

const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const JWT_KEY = 'makeblackmetalhateagain';
const fs = require('fs');

const router = express.Router();

const checkCategory = async (name_category) => {
    const categoryName = await Category.findOne(
        {
            where: {
                name: {
                    [Op.like]: name_category
                }
            }
        }
    );
    if (categoryName) {
        throw new Error("category can't be duplicated");
    }
};

router.post('/admin/category/add', async function (req, res) {
    let { name} = req.body;

    let newIdPrefix = "CTGR";
    let keyword = `%${newIdPrefix}%`
    let similiarUID = await Category.findAll({
        where: {
            id_category: {
                [Op.like]: keyword
            }
        }
    });

    let newIdCategory = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');
    const newCategory = await Category.create({
        id_category: newIdCategory,
        name: name,
        created_at: Date.now(),
    });
    return res.status(201).send({ message: "category " + name + " berhasil ditambahkan" });
});
router.get('/admin/category', async function (req, res) {
    const { page, pageSize } = req.query;
    const limit = pageSize || 6;
    const offset = (page - 1) * limit || 0;

    try {
        const {rows, count} = await Category.findAndCountAll({
            limit,
            offset,
             order: [
                [Sequelize.literal(`id_category`), 'ASC'],
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