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
const Plan = require("../../models/Plan");

const router = express.Router();

const checkEmailFans = async (email) => {
  const dataCheck = await Fans.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
  });
  if (dataCheck) {
    const error = new Error("Email already taken");
    error.path = "email"; 
    throw error; 
  }
  return email; 
};

const checkUsernameFans = async (username) => {
  const dataCheck = await Fans.findOne({
    where: {
      username: {
        [Op.like]: username,
      },
    },
  });
  if ( dataCheck) {
    const error = new Error("Username already taken");
    error.path = "username"; 
    throw error; 
  }
  return username; 
};

const checkEmailArtist = async (email) => {
  const dataCheck = await Artist.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
  });
  if (dataCheck) {
    const error = new Error("Email already taken");
    error.path = "email"; 
    throw error; 
  }
  return email; 
};

const checkUsernameArtist = async (username) => {
  const dataCheck = await Artist.findOne({
    where: {
      username: {
        [Op.like]: username,
      },
    },
  });
  if (dataCheck) {
    const error = new Error("Username already taken");
    error.path = "username"; 
    throw error; 
  }
  return username; 
};

const checkNameArtist = async (name) => {
  const dataCheck = await Artist.findOne({
    where: {
      name: {
        [Op.like]: name,
      },
    },
  });
  if (dataCheck) {
    const error = new Error("name already taken");
    error.path = "name"; 
    throw error; 
  }
  return name; 
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/image/avatar");
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
          console.error("Error deleting file on abort:", err);
        });
      });
      file.stream.emit("end");
    });
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    const error = new Error("Only .png, .jpg, and .jpeg formats are allowed!");
    error.path = "file";
    return cb(error);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
 });

router.post(
  "/admin/artist/add",
  upload.single("image"),
  async function (req, res) {
    let { name, email, username, password, genre, formed } = req.body;
    const filePath = req.file.filename;

    const schema = Joi.object({
    email: Joi.string().external(checkEmailArtist).email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
    name: Joi.string().min(4).external(checkNameArtist).required(),
    username: Joi.string().min(4).external(checkUsernameArtist).pattern(new RegExp('^[a-z0-9]+$')).required(),
    genre: Joi.string().required(),
    password: Joi.string().min(6).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    formed: Joi.string().required(),
    });
   
    try {
    await schema.validateAsync(req.body);
    let newIdPrefixArtist = "ART";
    let highestIdEntryArtist = await Artist.findOne({
      where: {
        id_artist: {
          [Op.like]: `${newIdPrefixArtist}%`
        }
      },
      order: [[ 'id_artist', 'DESC' ]] 
    });
    let newIdNumberArtist = 1;
    if (highestIdEntryArtist) {
      let highestIdArtist = highestIdEntryArtist.id_artist;
      let numericPartArtist = highestIdArtist.replace(newIdPrefixArtist, ''); 
      newIdNumberArtist = parseInt(numericPartArtist, 10) + 1;
    }
  let newIdArtist = newIdPrefixArtist + newIdNumberArtist.toString().padStart(3, '0');
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
      return res.status(201).json({message:"Successfully add account Artist"});
    } catch (error) {
      if (error.isJoi) {
      return res.status(400).json({
        message: error.details[0].message, 
        path: error.details[0].path[0],   
      });
      }else if (error.path) {
      return res.status(400).json({
        message: error.message,
        path: error.path,
      });
    } else {
      return res.status(400).json({ message: error.message });
    }
    }
  },
);

router.get("/admin/artists", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 9;
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
router.get("/admin/choose/artist", async function (req, res) {
  try {
    const data = await Artist.findAll();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("Failed to get data artist" + error);
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
      email: Joi.string().external(checkEmailFans).email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
      password: Joi.string().min(6).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
      username: Joi.string().min(4).external(checkUsernameFans).pattern(new RegExp('^[a-z0-9]+$')).required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      gender: Joi.string().required(),
      birth: Joi.date().required(),
    });

    try {
      await schema.validateAsync(req.body);
      let newIdPrefixFans = "FNS";
      let highestIdEntryFans = await Fans.findOne({
      where: {
        id_fans: {
          [Op.like]: `${newIdPrefixFans}%`
        }
      },
      order: [[ 'id_fans', 'DESC' ]] 
    });
    let newIdNumberFans = 1;
    if (highestIdEntryFans) {
      let highestIdFans = highestIdEntryFans.id_fans;
      let numericPartFans = highestIdFans.replace(newIdPrefixFans, ''); 
      newIdNumberFans = parseInt(numericPartFans, 10) + 1;
    }
    let newIdFans = newIdPrefixFans + newIdNumberFans.toString().padStart(3, '0');
    
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
    let newIdPrefixPlan = "PLN";
    let highestIdEntryPlan = await Plan.findOne({
      where: {
        id_plan: {
          [Op.like]: `${newIdPrefixPlan}%`
        }
      },
      order: [[ 'id_plan', 'DESC' ]] 
    });
    let newIdNumberPlan = 1;
    if (highestIdEntryPlan) {
      let highestIdPlan = highestIdEntryPlan.id_plan;
      let numericPartPlan = highestIdPlan.replace(newIdPrefixPlan, ''); 
      newIdNumberPlan = parseInt(numericPartPlan, 10) + 1;
    }
    let newIdPlan = newIdPrefixPlan + newIdNumberPlan.toString().padStart(3, '0');
    await Plan.create({
       id_plan: newIdPlan,
       id_fans: newIdFans,
       status: 1,
       type: 'free',
       start: Date.now(),
       expired: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
       limit_listening: 5,
       created_at: Date.now()
     });
     return res.status(201).json({message:"Successfully add account Fans"});
    } catch (error) {
      if (error.isJoi) {
      return res.status(400).json({
        message: error.details[0].message, 
        path: error.details[0].path[0],   
      });
      }else if (error.path) {
      return res.status(400).json({
        message: error.message,
        path: error.path,
      });
    } else {
      return res.status(400).json({ message: error.message });
    }
    }
    
  },
);
router.get("/admin/fans", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 9;
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
