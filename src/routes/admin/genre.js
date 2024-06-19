const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Genre = require("../../models/Genre");

const router = express.Router();

const checkGenre = async (name) => {
  const checkGenreName = await Genre.findOne({
    where: {
      name: {
        [Op.like]: name,
      },
    },
  });
  if (checkGenreName) {
    throw new Error("genre can't be duplicated");
  }
};
router.post("/admin/genre/add", async function (req, res) {
  let { name } = req.body;

  let newIdPrefix = "GNR";
  let keyword = `%${newIdPrefix}%`;
  let similiarUID = await Genre.findAll({
    where: {
      id_genre: {
        [Op.like]: keyword,
      },
    },
  });

  let newIdGenre =
    newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
  const newGenre = await Genre.create({
    id_genre: newIdGenre,
    name: name,
    created_at: Date.now(),
  });
  return res
    .status(201)
    .send({ message: "genre " + name + " berhasil ditambahkan" });
});
router.get("/admin/genres", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 6;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Genre.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_genre`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/admin/genre", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Genre.findOne({
      where: {
        id_genre: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(404).send("data tidak ditemukan");
  }
});
router.put("/admin/genre", async function (req, res) {
  const { id } = req.query;
  try {
    await Genre.update(req.body, {
      where: {
        id_genre: {
          [Op.like]: id,
        },
      },
    });
    return res.status(201).send("Data berhasil diubah");
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});


module.exports = router;
