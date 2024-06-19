const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Album = require("../../models/Album");

const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const JWT_KEY = "makeblackmetalhateagain";
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/image/album");
  },
  fileFilter: function name(req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  filename: function name(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, fileName);
    },
});

const upload = multer({ storage: storage });
router.post(
  "/artist/album/add",
  upload.single("image"),
  async function (req, res) {
    const { id } = req.query;
    const { name, description, status } = req.body;

    const filePath = req.file.filename;

    let newIdPrefix = "ALBM";
    let keyword = `%${newIdPrefix}%`;
    let similiarUID = await Album.findAll({
      where: {
        id_album: {
          [Op.like]: keyword,
        },
      },
    });
    let newIdAlbum =
      newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
    
    await Album.create({
      id_album: newIdAlbum,
      id_artist: id,
      name: name,
      description: description,
      image: filePath,
      created_at: Date.now(),
      status: status,
    });
    return res
      .status(201)
      .send({ message: "album berhasil " + name + " ditambahkan"});
  },
);

router.get("/artist/collection/album", async function (req, res) {
  const { id } = req.query;
  const { page, pageSize } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Album.findAndCountAll({
      where: {
        id_artist:id,
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            id_artist: {
              [Op.like]: id,
            },
          },
        },
      ],
      limit,
      offset,
      order: [[Sequelize.literal(`name`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/artist/album", async function (req, res) {
  const { id } = req.query;

  try {
    const data = await Album.findAll({
      where: {
        id_artist:id,
      }
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
module.exports = router;
