const jwt = require("jsonwebtoken");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Plan = require("../../models/Plan");
const Fans = require("../../models/Fans");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
router.post("/admin/plan/add", async function (req, res) {
  let { name, duration, desc, price } = req.body;

  let newIdPrefix = "PLN";
  let keyword = `%${newIdPrefix}%`;
  let similiarUID = await Plan.findAll({
    where: {
      id_plan: {
        [Op.like]: keyword,
      },
    },
  });

  let newIdPlan =
    newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
  const newPlan = await Plan.create({
    id_plan: newIdPlan,
    name: name,
    duration: duration,
    description: desc,
    price: price,
    created_at: Date.now(),
  });
  return res
    .status(201)
    .send({ message: "plan " + name + " berhasil ditambahkan" });
});

router.get("/admin/plan", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

  const { page, pageSize } = req.query;
  const limit = pageSize || 9;
  const offset = (page - 1) * limit || 0;
   
    
  try {
   const { rows, count } = await Plan.findAndCountAll({
      include: {
              model: Fans,
              attributes: ["email", "avatar", "username"]
        },
      limit,
      offset,
      order: [[Sequelize.literal(`id_plan`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("Failed to get data");
  }
});
router.get("/admin/plan/detail", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

  const { id } = req.query;
  
  try {
    const data = await Plan.findByPk(id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json("Failed to get data");
  }
});
module.exports = router;
