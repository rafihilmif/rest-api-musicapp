const jwt = require("jsonwebtoken");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Fans = require("../../models/Fans");
const Artist = require("../../models/Artist");
const Plan = require("../../models/Plan");
const Playlist = require("../../models/Playlist");
const Cart = require("../../models/Cart");
const CartItem = require("../../models/CartItem");
const PlaylistSong = require("../../models/PlaylistSong");
const Album = require("../../models/Album");
const Merch = require("../../models/Merch");

const Joi = require("joi");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ImageMerch = require("../../models/ImageMerch");
const Song = require("../../models/Song");
const Shows = require("../../models/Shows");

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
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userdata = jwt.verify(token, process.env.JWT_KEY);
  
    if (userdata.role !== "admin") {
      return res.status(401).json({ message: 'your are not admin' });
    }
    
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
        verify_token: null,
        is_verified: 0,
        verify_token_expired: null,
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
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

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
    return res.status(200).json({ message: "Successfully update data artist" });
  } catch (error) {
    return res.status(400).send("Gagal merubah data");
  }
});
router.get("/admin/choose/artist", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

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
     const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

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
        verify_token: null,
        is_verified: 0,
        verify_token_expired: null,
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
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

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
     return res.status(200).json({ message: "Successfully update data fans" });
  } catch (error) {
    return res.status(400).send("Gagal merubah data");
  }
});
router.put("/admin/fans/block", async function (req, res) {
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
    await Fans.update({ status: 0 }, {
      where: {
        id_fans: id
      }
    });
  
    await Playlist.update({ status: 0 }, {
      where: {
        id_user: id
      }
    });
   return res.status(200).json({ message: "Fans has been block" });
  } catch (error) {
    return res.status(400).send("Failed to block fans");
  }
});
router.put("/admin/fans/unblock", async function (req, res) {
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
    await Fans.update({ status: 1 }, {
      where: {
        id_fans: id
      }
    });
  
    await Playlist.update({ status: 1 }, {
      where: {
        id_user: id
      }
    });
   return res.status(200).json({ message: "Fans has been unblock" });
  } catch (error) {
    return res.status(400).send("Failed to unblock fans");
  }
});

router.delete("/admin/fans/delete", async function (req, res) {
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
    if (!id) {
      return res.status(400).json({ error: "Fans ID is required" });
    }

    const dataFans = await Fans.findOne({
      where: {
        id_fans: id
      }
    });

    if (!dataFans) {
      return res.status(404).json({ error: "Fans not found" });
    }

    const dataCart = await Cart.findOne({
      where: {
        id_fans: id
      }
    });

    if (dataCart) {
      await CartItem.destroy({
        where: {
          id_cart: dataCart.id_cart
        }
      });
      
      await Cart.destroy({
        where: {
          id_fans: id
        }
      });
    }

    const dataPlaylist = await Playlist.findAll({
      where: { id_user: id }
    });

    for (const playlist of dataPlaylist) {
      await PlaylistSong.destroy({
        where: { id_playlist: playlist.id_playlist }
      });
      
      const oldFileImage = "./public/assets/image/playlist/" + playlist.image;

      fs.unlink(oldFileImage, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
      await Playlist.destroy({
        where: { id_user: id }
      });
    }

    await Plan.destroy({
      where: {
        id_fans: id
      }
    });

    if (dataFans.avatar) {
      const oldFilePath = "./public/assets/image/avatar/" + dataFans.avatar;
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting fan avatar:", err);
        }
      });
    }

    await Fans.destroy({
      where: {
        id_fans: id
      }
    });

    return res.status(200).json({ 
      success: true,
      message: "Successfully deleted fans" 
    });

  } catch (error) {
    console.error("Error in fans deletion:", error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to delete fans",
      details: error.message 
    });
  }
});

router.delete("/admin/artist/delete", async function (req, res) {
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
   
    if (!id) {
      return res.status(400).json({ error: "Artist ID is required" });
    }

    const dataArtist = await Artist.findOne({
      where: { id_artist: id }
    });

    if (!dataArtist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const dataPlaylist = await Playlist.findAll({
      where: { id_user: id }
    });

    for (const playlist of dataPlaylist) {
      await PlaylistSong.destroy({
        where: { id_playlist: playlist.id_playlist }
      });
      
      const oldFileImage = "./public/assets/image/song/" + playlist.image;

      fs.unlink(oldFileImage, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
      await Playlist.destroy({
        where: { id_user: id }
      });
    }

    const dataMerchandise = await Merch.findAll({
      where: { id_artist: id }
    });

    for (const merch of dataMerchandise) {
      const dataImage = await ImageMerch.findAll({
        where: { id_merchandise: merch.id_merchandise }
      });
      
      const imageDeletion = dataImage.map(async (image) => {
        const oldFilePath = "./public/assets/image/merchandise/" + image.name;
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting the old image:", err);
            return res.status(500).send("Error deleting the old image");
          }
        });
      });
      await Promise.all(imageDeletion);
      
      await ImageMerch.destroy({
        where: { id_merchandise: merch.id_merchandise }
      });
    }
    await Merch.destroy({
      where: { id_artist: id }
    });

    const dataSong = await Song.findAll({
      where: { id_artist: id }
    });

    if (dataSong.length > 0) {
      await PlaylistSong.destroy({
        where: {
          id_song: {
            [Op.in]: dataSong.map(song => song.id_song)
          }
        }
      });

      for (const song of dataSong) {
        const oldFileSongPath = "./public/assets/audio/" + song.audio;
        const oldFileImage = "./public/assets/image/song/" + song.image;

        fs.unlink(oldFileSongPath, (err) => {
          if (err) {
            console.error("Error deleting the old audio:", err);
            return res.status(500).send("Error deleting the old audio");
          }
        });
        
        fs.unlink(oldFileImage, (err) => {
          if (err) {
            console.error("Error deleting the old image:", err);
            return res.status(500).send("Error deleting the old image");
          }
        });
      }
    }
    
    await Song.destroy({
      where: { id_artist: id }
    });

    const dataAlbum = await Album.findAll({
      where: { id_artist: id }
    });

    for (const album of dataAlbum) {
      const oldFileImage = "./public/assets/image/album/" + album.image;
      fs.unlink(oldFileImage, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
    }
    
    await Album.destroy({
      where: { id_artist: id }
    });

    const dataShow = await Shows.findAll({
      where: { id_artist: id }
    });

    for (const show of dataShow) {
      const oldFileImage = "./public/assets/image/shows/" + show.image;
      fs.unlink(oldFileImage, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
    }
    
    await Shows.destroy({
      where: { id_artist: id }
    });

    if (dataArtist.avatar) {
      const oldFilePath = "./public/assets/image/avatar/" + dataArtist.avatar;
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
    }

    await Artist.destroy({
      where: { id_artist: id }
    });

    return res.status(200).json({ message: "Successfully deleted artist" });

  } catch (error) {
    console.error("Error in artist deletion:", error);
    return res.status(500).json({ error: "Failed to delete artist" });
  }
});

router.get("/admin/account/fans/total", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }


  try {
    const total = await Fans.count();
    res.status(200).json(total);
  } catch (error) {
    return res.status(400).json("Failed to get total data fans");
  }
});
router.get("/admin/account/artist/total", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

  try {
    const total = await Artist.count();
    res.status(200).json(total);
  } catch (error) {
    return res.status(400).json("Failed to get total data artist");
  }
});
module.exports = router;
