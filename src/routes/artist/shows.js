const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Artist = require("../../models/Artist");
const Shows = require("../../models/Shows");

const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const JWT_KEY = "makeblackmetalhateagain";
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function name(req, file, cb) {
    cb(null, "./public/assets/image/shows");
  },
  fileFilter: function name(req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only .png, .gif, .jpg and .jpeg format allowed!"));
    }
  },
  filename: function name(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, fileName);
    req.on("aborted", () => {
      const fullFilePath = path.join("assets", "image", "shows", fileName);
      file.stream.on("end", () => {
        fs.unlink(fullFilePath, (err) => {
          console.log(fullFilePath);
          if (err) {
            throw err;
          }
        });
      });
      file.stream.emit("end");
    });
  },
});

const upload = multer({ storage: storage });
router.post("/artist/shows/add", upload.single("image"), async function (req, res) {
  const { id } = req.query;
  let { name, date, location, contact, description, status } = req.body;
  let { image } = req.file;

  const filePath = req.file.filename;

  let newIdPrefix = "SWHS";
  let keyword = `%${newIdPrefix}%`;
  let similiarUID = await Shows.findAll({
    where: {
      id_show: {
        [Op.like]: keyword,
      },
    },
  });
  let newIdShows =
    newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
  await Shows.create({
    id_show: newIdShows,
    id_artist: id,
    name: name,
    duedate: date,
    location: location,
    contact: contact,
    description: description,
    image: filePath,
    created_at: Date.now(),
    status: status,
  });
  return res
    .status(201)
    .send({ message: 'shows berhasil ditambahkan'});
});
//SHOW ALL EVENT
router.get("/shows", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 12;
  const offset = (page - 1) * limit || 0;

  const token = req.headers.authorization.split(" ")[1];
  // let token = req.header('x-auth-token');
  let userdata = jwt.verify(token, JWT_KEY);

  try {
    const { rows, count } = await Shows.findAndCountAll({
      where: {
        id_artist: userdata.id_artist,
      },
      include: {
        model: Artist,
        attributes: ["id_artist", "name"],
        where: {
          id_artist: {
            [Op.like]: userdata.id_artist,
          },
        },
      },
      limit,
      offset,
      order: [[Sequelize.literal("name", "ASC")]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
module.exports = router;
