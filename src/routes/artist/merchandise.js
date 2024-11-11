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
const CartItem = require("../../models/CartItem");
const JWT_KEY = "makeblackmetalhateagain";
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/image/merchandise");
  },
  filename: function name(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, fileName);
    req.on("aborted", () => {
      const fullFilePath = path.join("assets", "image", "merchandise", fileName);
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
  limits: { files: 5 },
  fileFilter: fileFilter,
});
router.post('/artist/merchandise/add', upload.array('image', 5), async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
  }
  
  let { name, category, sizeS, sizeM, sizeL, sizeXL, price, description, stock, status } = req.body;

   const imageUrl = req.files.map((file, index) => ({
    filename: file.filename,
    number: index + 1,
   }));
  
  const schema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().greater(0).required(),
    description: Joi.string(),
    status: Joi.number(),
    sizeS: Joi.number(),
    sizeM: Joi.number(),
    sizeL: Joi.number(),
    sizeXL: Joi.number(),
    stock: Joi.number()
  });

  
  
  try {
    await schema.validateAsync(req.body);
    const userdata = jwt.verify(token, process.env.JWT_KEY);

    const artistTemp = await Artist.findByPk(userdata.id_artist);

    let newIdPrefixMerch = "MRCH";
    let highestIdEntryMerch = await Merch.findOne({
      where: {
        id_merchandise: {
          [Op.like]: `${newIdPrefixMerch}%`
        }
      },
      order: [['id_merchandise', 'DESC']]
    });
    let newIdNumberMerch = 1;
    if (highestIdEntryMerch) {
      let highestIdMerch = highestIdEntryMerch.id_merchandise;
      let numericPartMerch = highestIdMerch.replace(newIdPrefixMerch, ''); 
      newIdNumberMerch = parseInt(numericPartMerch, 10) + 1;
    }
    let newIdMerchandise = newIdPrefixMerch + newIdNumberMerch.toString().padStart(3, '0');

    const data = await Merch.create({
      id_merchandise: newIdMerchandise,
      id_artist: userdata.id_artist,
      name: name,
      artist: artistTemp.name,
      category: category,
      s: sizeS,
      m: sizeM,
      l: sizeL,
      xl: sizeXL,
      stock: stock,
      price: price,
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
    return res.status(201).json({
      message: "Successfully added merchandise",
      data: data
    });
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
});

router.get("/artist/collection/merchandise", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const {id,page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    const userdata = jwt.verify(token, process.env.JWT_KEY);

    const { rows, count } = await Merch.findAndCountAll({
      where: {
        id_artist: id,
        status: 1
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
          where: {
           id_artist: id,
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
router.get("/artist/collection/merchandise/sort/tshirt", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const {id,page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    const userdata = jwt.verify(token, process.env.JWT_KEY);

    const { rows, count } = await Merch.findAndCountAll({
      where: {
       id_artist: id,
        category: 'T-shirt'
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
          where: {
           id_artist: id,
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
router.get("/artist/collection/merchandise/sort/longsleeve", async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const {id,page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
     const userdata = jwt.verify(token, process.env.JWT_KEY);
    const { rows, count } = await Merch.findAndCountAll({
      where: {
         id_artist: id,
        category: 'Long Sleeve'
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
          where: {
             id_artist: id,
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
router.get("/artist/collection/merchandise/sort/zipper", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const {id,page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
     const userdata = jwt.verify(token, process.env.JWT_KEY);
    const { rows, count } = await Merch.findAndCountAll({
      where: {
       id_artist: id,
        category: 'Zipper Hoodie'
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
          where: {
           id_artist: id,
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
router.get("/artist/collection/merchandise/sort/hoodie", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const {id,page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
     const userdata = jwt.verify(token, process.env.JWT_KEY);
    const { rows, count } = await Merch.findAndCountAll({
      where: {
       id_artist: id,
        category: 'Hoodie'
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
          where: {
            id_artist: id,
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
router.get("/artist/collection/merchandise/sort/sweatshirt", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const {id,page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
     const userdata = jwt.verify(token, process.env.JWT_KEY);
    const { rows, count } = await Merch.findAndCountAll({
      where: {
       id_artist: id,
        category: 'Sweatshirt'
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
          where: {
           id_artist: id,
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
router.get("/artist/collection/merchandise/sort/accessories", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const {id,page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    
    const { rows, count } = await Merch.findAndCountAll({
      where: {
       id_artist: id,
        category: {
      [Op.and]: [{ [Op.notLike]: "%T-Shirt%" },{ [Op.notLike]: "%Long Sleeve%" },{ [Op.notLike]: "%Zipper Hoodie%" },
    { [Op.notLike]: "%Hoodie%" },
    { [Op.notLike]: "%Sweatshirt%" }
  ]
}
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
          where: {
          id_artist: id,
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
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

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

router.put('/artist/merch/update', upload.array('image', 5), async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { id } = req.query;
  const newData = req.body;

  try {
    const merch = await Merch.findByPk(id);

    if (!merch) {
      return res.status(404).send('Data not found');
    }
    const isGarment = ['T-shirt', 'Long Sleeve', 'Hoodie', 'Zipper Hoodie', 'Sweatshirt'].includes(merch.category);

    Object.keys(newData).forEach((key) => {
      if (newData[key] !== undefined && key !== 'image' && key !== 'number') {
        if (isGarment) {
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
        }
        
        if (!['sizeS', 'sizeM', 'sizeL', 'sizeXL'].includes(key)) {
          merch[key] = newData[key];
        }
      }
    });

    await merch.save();
    
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageData = {name: file.filename};

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
    return res.status(200).json({
      message: "Data merch successfully updated",
      data: newData
    });
  } catch (error) {
    console.error('Failed to update data:', error);
    return res.status(400).send('Failed to update data');
  }
});

router.get("/artist/merchandise", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { limit } = req.query || 5;
  try {
    const data = await Merch.findAll({
      where: {
        id_artist: id,
      },
      limit: limit
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).send("Failed to get data merch");
  }
});
router.get("/artist/total/merchadise", async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const userdata = jwt.verify(token, process.env.JWT_KEY);
    const data = await Merch.count({
      where: {
        id_artist: userdata.id_artist,
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("Failed to get total data merch");
  }
});
router.delete("/artist/merchandise/delete", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { id } = req.query;

  const dataImage = await ImageMerch.findAll({
    where: {
      id_merchandise: id
    }
  });

  try {
    await CartItem.destroy({
      where: {
        id_merchandise: id
      }
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
      await CartItem.destroy({
      where: {
        id_merchandise: id
      }
      });
    
     await Merch.destroy({
      where: {
        id_merchandise: id
      }
     });
    
    await ImageMerch.destroy({
      where: {
        id_merchandise: id
      }
    });
    return res.status(200).json("Successfully deleted merchandise");
  } catch (error) {
    return res.status(400).json("Failed to delete merchandise");
  }
});
module.exports = router;
