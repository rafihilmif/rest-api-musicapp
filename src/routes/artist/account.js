const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");

const router = express.Router();

router.get("/detail/artist", async function (req, res) {
  const { email } = req.query;
  const data = await Artist.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
    attributes: {
      exclude: ["password", "created_at", "status"],
    },
  });
  return res.status(200).json(data);
});
module.exports = router;
