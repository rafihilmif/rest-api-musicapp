const { response } = require("express");
const express = require("express");
const { Op, Sequelize, where } = require("sequelize");
const Artist = require("../../models/Artist");
const Merch = require("../../models/Merch");
const router = express.Router();


const Joi = require("joi");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const ImageMerch = require("../../models/ImageMerch");
const JWT_KEY = "makeblackmetalhateagain";
const fs = require('fs').promises;

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
const upload = multer({ 
  storage: storage,
  // Limit to 5 files
  limits: { files: 5 }
});
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
router.get('/artist/image/merchandise', async function (req, res) {
  const { id } = req.query;
  const { number } = req.query;

  if (number) {
    try {
    const data = await ImageMerch.findAll({
      where: {
        id_merchandise: {
          [Op.like]: id
        },
        number: {
          [Op.like] : number
        }
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('gagal memuat gambar merchandise');
  }
  }
  else {
     try {
    const data = await ImageMerch.findAll({
      where: {
        id_merchandise: {
          [Op.like]: id
        }
      },
      order: [[Sequelize.literal(`number`), "ASC"]],
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('gagal memuat gambar merchandise');
  }
  }
 
});
router.post('/artist/merchandise/add', upload.array('image', 5), async function (req, res) {

  const { id } = req.query;
  let { name, artist, category, sizeS, sizeM, sizeL, sizeXL, price, description, stock, status } = req.body;
  const imageUrl = req.files.map((file, index) => ({
    filename: file.filename,
    number: index + 1,
  }));

  let newIdPrefix = "MRCH";
  let keyword = `%${newIdPrefix}%`
  let similiarUID = await Merch.findAll({
        where: {
            id_merchandise: {
                [Op.like]: keyword
            }
        }
  });
  
  let newIdMerchandise = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');

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
        stock: stock,
        price:price,
        description: description,
        status: status,
        created_at: Date.now(),
        status: 1,
  });

    const imageEntries = imageUrl.map(({ filename, number }) => ({
    id_merchandise: newIdMerchandise,
    name: filename,
    number: number,
  }));

  await ImageMerch.bulkCreate(imageEntries);

  return res.status(201).send({ message: "merchandise berhasil ditambahkan" });
});

router.put('/artist/merch/update', upload.array('image', 5), async function (req, res) {
  const { id } = req.query;
  const newData = req.body;

  try {
    const merch = await Merch.findByPk(id);

    if (!merch) {
      return res.status(404).send('Data not found');
    }

    Object.keys(newData).forEach((key) => {
      if (newData[key] !== undefined && key !== 'image' && key !== 'number') {
        if (key === 'sizeS') {
          merch.s = parseInt(newData[key]) || 0;
        } 
        if (key === 'sizeM') {
          merch.m = parseInt(newData[key]) || 0;
        } 
        if (key === 'sizeL') {
          merch.l = parseInt(newData[key]) || 0;
        } 
        if (key === 'sizeXL') {
          merch.xl = parseInt(newData[key]) || 0;
        }
        else {
           merch[key] = newData[key];
        }
      }
    });

    merch.stock = parseInt(merch.s) + parseInt(merch.m ) + parseInt(merch.l) + parseInt(merch.xl );

    await merch.save();
    
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageData = {
          name: file.filename, 
        };

        const number = Array.isArray(newData.number) ? newData.number[i] : newData.number;

        const oldImage = await ImageMerch.findOne({
          where: {
            id_merchandise: id,
            number: number,
          }
        });

        if (oldImage) {
          const filePath = "./public/assets/image/merchandise/" + oldImage.name; 
          await fs.unlink(filePath); 
        }

        await ImageMerch.update(
          imageData,
          {
            where: {
              id_merchandise: id,
              number: number,
            },
          }
        );
      }
    }

 
    return res.status(200).send('Data successfully updated');
  } catch (error) {
    console.error('Failed to update data:', error);
    return res.status(400).send('Failed to update data');
  }
});

router.get("/artist/merchandise", async function (req, res) {
  const { id } = req.query;
  const { limit } = req.query || 5;
  try {
   const data = await Merch.findAll({
      where: {
        id_artist:id,
      },
      limit: limit
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
module.exports = router;
