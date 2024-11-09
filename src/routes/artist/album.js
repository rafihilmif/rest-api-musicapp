const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Album = require("../../models/Album");

const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Joi = require("joi");
const Song = require("../../models/Song");
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
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const { name, description, status } = req.body;

    const filePath = req.file.filename;

    const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null),
    status: Joi.number(),
     });
    
    try {
      await schema.validateAsync(req.body);
      const userdata = jwt.verify(token, process.env.JWT_KEY);

      let newIdPrefixAlbum = "ALBM";
      let highestIdEntryAlbum = await Album.findOne({
        where: {
          id_album: {
            [Op.like]: `${newIdPrefixAlbum}%`
          }
        },
        order: [['id_album', 'DESC']]
      });
      let newIdNumberAlbum = 1;
      if (highestIdEntryAlbum) {
      let highestIdAlbum = highestIdEntryAlbum.id_album;
      let numericPartAlbum = highestIdAlbum.replace(newIdPrefixAlbum, ''); 
      newIdNumberAlbum = parseInt(numericPartAlbum, 10) + 1;
      }
      let newIdAlbum = newIdPrefixAlbum + newIdNumberAlbum.toString().padStart(3, '0');

      await Album.create({
        id_album: newIdAlbum,
        id_artist: userdata.id_artist,
        name: name,
        description: description,
        image: filePath,
        created_at: Date.now(),
        status: status,
      });
     return res.status(201).json({message:"Successfully added album"});
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

router.get("/artist/collection/album", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const {page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
   const { rows, count } = await Album.findAndCountAll({
      where: {
        id_artist: userdata.id_artist,
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            id_artist: userdata.id_artist
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
router.get('/artist/collection/album/sort/new', async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const {page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

   try {
      const { rows, count } = await Album.findAndCountAll({
      where: {
        id_artist: userdata.id_artist,
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            id_artist: userdata.id_artist,
          },
        },
      ],
      limit,
      offset,
      order: [[Sequelize.literal(`created_at`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get('/artist/collection/album/sort/old', async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const {page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Album.findAndCountAll({
      where: {
        id_artist: userdata.id_artist,
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            id_artist: userdata.id_artist,
          },
        },
      ],
      limit,
      offset,
      order: [[Sequelize.literal(`created_at`), "DESC"]],
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
  const { id, limit, name } = req.query;
  const limitValue = parseInt(limit);
 
  try {
    if (limitValue) {
      const data = await Album.findAll({
      where: {
        id_artist: id
      },
      limit: limitValue,
    });
    return res.status(200).json(data);
    }
    if (name) {
      const data = await Album.findAll({
        where: {
          id_artist: {
            [Op.like] : id
          },
           name: {
          [Op.notLike]: name
        }
        }
      });
      return res.status(200).json(data);
    }
    else {
      const data = await Album.findAll({
      where: {
        id_artist: id,
      }
    });
    return res.status(200).json(data);
    }
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/artist/detail/album", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Album.findOne({
      where: {
        id_album: {
          [Op.like]: id
        }
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data album");
  }
});

router.put("/artist/album/update", upload.single('image'), async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { id } = req.query;
  const newData = req.body;

  try {
    const album = await Album.findByPk(id);

    if (!album) {
      return res.status(404).send('Data not found');
    }

    Object.keys(newData).forEach((key) => {
      if (newData[key] !== undefined && key !== 'image') {
        album[key] = newData[key];
      }
    });
 
    if (req.file) {
      const oldFilePath = "./public/assets/image/album/" + album.image;
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
      album.image = req.file.filename;
    }

    await album.save();

    return res.status(200).send('Data successfully updated');
  } catch (error) {
    console.error('Failed to update data:', error);
    return res.status(400).send('Failed to update data');
  }
});

router.delete("/artist/album/delete", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { id } = req.query;
  
  const data = await Album.findOne(
    {
      where: {
        id_album: id
      }
    }
  );

  try {
    await Song.update(
      {
        id_album: "-",
        album: "-"
      }
      ,
      {
        where: {
          id_album: id,
        }
      });
    const oldFilePath = "./public/assets/image/album/" + data.image;
    fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
    });
    await Album.destroy({
      where: {
        id_album: id
      }
    });
    return res.status(200).json("Album has been deleted");
  } catch (error) {
    return res.status(400).json("Failed to delete album");
  }
});

module.exports = router;
