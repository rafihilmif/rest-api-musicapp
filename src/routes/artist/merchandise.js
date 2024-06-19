const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Artist = require("../../models/Artist");
const Merch = require("../../models/Merch");
const router = express.Router();

const Joi = require("joi");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const JWT_KEY = "makeblackmetalhateagain";
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/image/merchandise");
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
      const fullFilePath = path.join("assets", "image", "album", fileName);
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
router.post(
  "/artist/merchandise/add",
  upload.single("image"),
  async function (req, res) {
    const { id } = req.query;
    let { name, artist, category, sizeS, sizeM, sizeL, sizeXL, price, description, status } =
      req.body;

    const filePath = req.file.filename;

    let newIdPrefix = "MRCH";
    let keyword = `%${newIdPrefix}%`;
    let similiarUID = await Merch.findAll({
      where: {
        id_merchandise: {
          [Op.like]: keyword,
        },
      },
    });

    let newIdMerchandise = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
    await Merch.create({
      id_merchandise: newIdMerchandise,
      id_artist: id,
      name: name,
      artist: artist,
      category: category,
      s: sizeS,
      m: sizeM,
      l: sizeL,
      xl: sizeXL,
      price: price,
      description: description,
      image: filePath,
      created_at: Date.now(),
      status: status,
    });
    return res.status(201).send({
      message: "merchandise berhasil ditambahkan oleh " + artist,
    });
  },
);
router.get("/artist/collection/merchandise", async function (req, res) {
  const { id } = req.query;
  const { page, pageSize } = req.query;
  const limit = pageSize || 15;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Merch.findAndCountAll({
      where: {
        id_artist: id,
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
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

//FAILED UPLOAD MULTI IMAGE

// router.post('/merchandise/add', upload.any(), async function (req, res) {
//     let { name, category, sizeS, sizeM, sizeL, sizeXL, price, description } = req.body;

//     const files = req.files;
//     const token = req.headers.authorization.split(' ')[1];
//     let userdata = jwt.verify(token, JWT_KEY);

//     let newIdPrefix = "MRC";
//     let keyword = `%${newIdPrefix}%`
//     let similiarUID = await Merch.findAll({
//         where: {
//             id_merchandise: {
//                 [Op.like]: keyword
//             }
//         }
//     });
//     const imagesObject = files.map(file => ({
//         images: file.filename
//      }));
//    const valueImages = [];
//    for (const obj of imagesObject) {
//         const { images } = obj;
//         valueImages.push(images);
//     }
//     console.log([valueImages]);
//     let newIdMerchandise = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');

//     console.log(valueImages.length);
//    const newMerch = await Merch.create({
//         id_merchandise: newIdMerchandise,
//         id_artist: userdata.id_artist,
//         name: name,
//         artist: userdata.name,
//         category: category,
//         s: sizeS,
//         m: sizeM,
//         l: sizeL,
//         xl: sizeXL,
//         price:price,
//         description:description,
//         image:[valueImages],
//         created_at: Date.now(),
//         status: 1,
//       });

//     return res.status(201).send({message: "merchandise berhasil ditambahkan oleh " + userdata.name})
// });
module.exports = router;
