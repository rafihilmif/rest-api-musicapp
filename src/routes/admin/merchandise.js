const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Category = require("../../models/Category");
const Merch = require("../../models/Merch");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { func } = require("joi");
const Merchandise = require("../../models/Merch");

const router = express.Router();

const checkCategory = async (name_category) => {
  const categoryName = await Category.findOne({
    where: {
      name: {
        [Op.like]: name_category,
      },
    },
  });
  if (categoryName) {
    throw new Error("category can't be duplicated");
  }
};
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

router.post("/admin/category/add", async function (req, res) {
  let { name } = req.body;

  let newIdPrefix = "CTGR";
  let keyword = `%${newIdPrefix}%`;
  let similiarUID = await Category.findAll({
    where: {
      id_category: {
        [Op.like]: keyword,
      },
    },
  });

  let newIdCategory =
    newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
  const newCategory = await Category.create({
    id_category: newIdCategory,
    name: name,
    created_at: Date.now(),
  });
  return res
    .status(201)
    .send({ message: "category " + name + " berhasil ditambahkan" });
});
router.get("/admin/categories", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 6;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Category.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_category`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/admin/category", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Category.findOne({
      where: {
        id_category: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(404).send("Data tidak ditemukan");
  }
});
router.put("/admin/category", async function (req, res) {
  const { id } = req.query;
  try {
    await Category.update(req.body, {
      where: {
        id_category: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).send("Data berhasil diubah");
  } catch (error) {
    return res.status(400).send("Gagal merubah data");
  }
});
router.get("/category", async function (req, res) {
  try {
    const dataCategory = await Category.findAll({});
    return res.status(200).json({
      data: dataCategory,
    });
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});

router.post(
  "/admin/merchandise/add",
  upload.single("image"),
  async function (req, res) {
    let {
      name,
      id_artist,
      sizeS,
      sizeM,
      sizeL,
      sizeXL,
      price,
      desc,
      category,
    } = req.body;
    const filePath = req.file.filename;

    const artist = await Artist.findAll({
      where: {
        id_artist: id_artist,
      },
    });
    let nameArtist = null;
    artist.forEach((item) => {
      nameArtist = item.name;
    });
    let newIdPrefix = "MRCH";
    let keyword = `%${newIdPrefix}%`;
    let similiarUID = await Merch.findAll({
      where: {
        id_merchandise: {
          [Op.like]: keyword,
        },
      },
    });

    let newIdMerchandise =
      newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
    await Merch.create({
      id_merchandise: newIdMerchandise,
      id_artist: id_artist,
      name: name,
      artist: nameArtist,
      category: category,
      s: sizeS,
      m: sizeM,
      l: sizeL,
      xl: sizeXL,
      price: price,
      description: desc,
      image: filePath,
      created_at: Date.now(),
      status: 1,
    });
    return res.status(201).send({
      message: "merchandise berhasil ditambahkan kepada " + nameArtist.name,
    });
  },
);
router.get("/admin/merchs", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 12;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Merch.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: Artist,
          attributes: ["avatar"],
        },
      ],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/admin/merch", async function (req, res) {
  const { id } = req.query;

  try {
    const data = await Merch.findOne({
      where: {
        id_merchandise: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(404).send("Gagal memuat data");
  }
});
router.put("/admin/merch", upload.single("image"), async function (req, res) {
  const { id } = req.query;
  const newData = req.body;

  try {
    const merch = await Merchandise.findByPk(id);
    console.log(merch);
    if (!merch) {
      return res.status(404).send("Data tidak ditemukan");
    }
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== undefined) {
        merch[key] = newData[key];
      }
    });
    if (req.file) {
      const oldFilePath = "./public/assets/image/merchandise/" + merch.image;
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
      merch.image = req.file.filename;
    }

    await merch.save();

    return res.status(200).send("Data berhasil diubah");
  } catch (error) {
    return res.status(400).send("Gagal merubah data");
  }
});
module.exports = router;
