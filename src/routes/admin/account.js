const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Fans = require("../../models/Fans");
const Artist = require("../../models/Artist");

const Joi = require("joi");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const checkEmail = async (email) => {
  const artistEmail = await Artist.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
  });
  const fansEmail = await Fans.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
  });
  if (artistEmail || fansEmail) {
    throw new Error("email has been taken");
  }
};
const checkUsername = async (username) => {
  const artistUsername = await Artist.findOne({
    where: {
      username: {
        [Op.like]: username,
      },
    },
  });
  const fansUsername = await Fans.findOne({
    where: {
      username: {
        [Op.like]: username,
      },
    },
  });
  if (artistUsername || fansUsername) {
    throw new Error("username has been taken");
  }
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/image/avatar");
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
      const fullFilePath = path.join("assets", "image", "avatar", fileName);
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
  "/admin/artist/add",
  upload.single("image"),
  async function (req, res) {
    let { name, email, username, password, genre, formed } = req.body;
    const filePath = req.file.filename;

    const schema = Joi.object({
      email: Joi.string()
        .external(checkEmail)
        .email({ minDomainSegments: 2, tlds: { allow: ["com"] } })
        .required(),
      username: Joi.string().external(checkUsername).required(),
      genre: Joi.string().required(),
      name: Joi.string().required(),
      password: Joi.string().required(),
      formed: Joi.string().required(),
    });
    let newIdPrefix = "ART";
    let keyword = `%${newIdPrefix}%`;
    let similiarUID = await Artist.findAll({
      where: {
        id_artist: {
          [Op.like]: keyword,
        },
      },
    });
    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(400).send(error.toString());
    }
    let newIdArtist =
      newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
    const passwordHash = bcrypt.hashSync(password, 10);
    Artist.create({
      id_artist: newIdArtist,
      email: email,
      name: name,
      password: passwordHash,
      username: username,
      formed: formed,
      genre: genre,
      role: "artist",
      description: null,
      avatar: filePath,
      created_at: Date.now(),
      status: 1,
    });
    return res.status(201).send({
      message: "berhasil menambahkan akun",
    });
  },
);

router.get("/admin/artists", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 12;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Artist.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_artist`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/admin/artist", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Artist.findOne({
      where: {
        id_artist: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).send("Gagal memuat data");
  }
});
router.put("/admin/artist", upload.single("image"), async function (req, res) {
  const { id } = req.query;
  const newData = req.body;

  try {
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).send("Data tidak ditemukan");
    }
    const saveNewUpdateData = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== undefined) {
        saveNewUpdateData[key] = newData[key];
      }
    });

    if (req.file) {
      const oldFilePath = "./public/assets/image/avatar/" + artist.avatar;
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
      saveNewUpdateData.avatar = req.file.filename;
    }
    if (newData.password !== undefined) {
      const passwordHash = bcrypt.hashSync(req.body.password, 10);
      saveNewUpdateData.password = passwordHash;
    }
    await artist.update(saveNewUpdateData);
  } catch (error) {
    return res.status(400).send("Gagal merubah data");
  }
});
router.put("/admin/artist/remove/avatar", async function (req, res) {
  const { id } = req.query;

  const pathAvatar = await Artist.findAll({
    where: {
      id_artist: {
        [Op.like]: id,
      },
    },
  });
  let tempPathAvatar = null;
  pathAvatar.forEach((element) => {
    tempPathAvatar = element.avatar;
  });
  try {
    await Artist.update(
      {
        avatar: null,
      },
      {
        where: {
          id_artist: {
            [Op.like]: id,
          },
        },
      },
    );
    const fullFilePath = "./public/assets/image/avatar/" + tempPathAvatar;
    fs.unlink(fullFilePath, (err) => {
      if (err) {
        console.error("Error deleting the image:", err);
        return res.status(500).json({ message: "Error deleting the image" });
      }
      res.status(200).json({ message: "Image deleted successfully" });
    });
  } catch (error) {
    return res.status(400).send("Gagal menghapus avatar");
  }
});
router.get("/admin/artist", async function (req, res) {
  try {
    const dataArtist = await Artist.findAll();
    return res.status(200).json({
      data: dataArtist,
    });
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});
router.post(
  "/admin/fans/add",
  upload.single("image"),
  async function (req, res) {
    let { first_name, last_name, email, username, password, gender, birth } =
      req.body;
    const filePath = req.file.filename;

    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string()
        .external(checkEmail)
        .email({ minDomainSegments: 2, tlds: { allow: ["com"] } })
        .required(),
      username: Joi.string().external(checkUsername).required(),
      gender: Joi.string().required(),
      password: Joi.string().required(),
      birth: Joi.string().required(),
    });
    let newIdPrefix = "FNS";
    let keyword = `%${newIdPrefix}%`;
    let similiarUID = await Fans.findAll({
      where: {
        id_fans: {
          [Op.like]: keyword,
        },
      },
    });
    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(400).send(error.toString());
    }
    let newIdFans =
      newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
    const passwordHash = bcrypt.hashSync(password, 10);
    Fans.create({
      id_fans: newIdFans,
      email: email,
      first_name: first_name,
      last_name: last_name,
      password: passwordHash,
      username: username,
      birth: birth,
      gender: gender,
      phone: null,
      role: "fans",
      avatar: filePath,
      created_at: Date.now(),
      status: 1,
    });
    return res.status(201).send({
      message: "berhasil menambahkan akun",
    });
  },
);
router.get("/admin/fans", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 12;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Fans.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_fans`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/admin/fan", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Fans.findOne({
      where: {
        id_fans: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(404).send("Data tidak ditemukan");
  }
});
router.put("/admin/fan/remove/avatar", async function (req, res) {
  const { id } = req.query;

  const pathAvatar = await Fans.findAll({
    where: {
      id_fans: {
        [Op.like]: id,
      },
    },
  });
  let tempPathAvatar = null;
  pathAvatar.forEach((element) => {
    tempPathAvatar = element.avatar;
  });

  try {
    const removeImage = await Fans.update(
      {
        avatar: null,
      },
      {
        where: {
          id_fans: {
            [Op.like]: id,
          },
        },
      },
    );
    const fullFilePath = "./public/assets/image/avatar/" + tempPathAvatar;
    fs.unlink(fullFilePath, (err) => {
      if (err) {
        console.error("Error deleting the image:", err);
        return res.status(500).json({ message: "Error deleting the image" });
      }
      res.status(200).json({ message: "Image deleted successfully" });
    });
  } catch (error) {
    return res.status(400).send("Gagal menghapus avatar");
  }
});
router.put("/admin/fan", upload.single("image"), async function (req, res) {
  const { id } = req.query;
  const newData = req.body;

  try {
    const fan = await Fans.findByPk(id);
    if (!fan) {
      return res.status(404).send("Data tidak ditemukan");
    }
    const saveNewUpdateData = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== undefined) {
        saveNewUpdateData[key] = newData[key];
      }
    });

    if (req.file) {
      const oldFilePath = "./public/assets/image/avatar/" + fan.avatar;
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
      saveNewUpdateData.avatar = req.file.filename;
    }
    if (newData.password !== undefined) {
      const passwordHash = bcrypt.hashSync(req.body.password, 10);
      saveNewUpdateData.password = passwordHash;
    }
    await fan.update(saveNewUpdateData);
  } catch (error) {
    return res.status(400).send("Gagal merubah data");
  }
});
module.exports = router;
