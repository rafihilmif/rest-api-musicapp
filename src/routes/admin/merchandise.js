const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Category = require("../../models/Category");
const Merch = require("../../models/Merch");

const multer = require("multer");
const path = require("path");
const fs = require('fs').promises;
const { func } = require("joi");
const Merchandise = require("../../models/Merch");
const ImageMerch = require("../../models/ImageMerch");


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
      const fullFilePath = path.join("assets", "image", "merchandise", fileName);
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
  limits: { files: 5 }
});

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
  const limit = pageSize || 9;
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

router.post('/admin/merchandise/add', upload.array('image', 5), async function (req, res) {
  const { id } = req.query;
  let { name, category, sizeS, sizeM, sizeL, sizeXL, price, description, stock, status } = req.body;

  const dataArtist = await Artist.findOne({
    id_artist: {
      [Op.like] : id
    }
  });
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
        artist: dataArtist.name,
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
router.get("/admin/choose/categories", async function (req, res) {
  try {
    const data = await Category.findAll();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json("Failed to get genre" + error);
  }
});
router.get("/admin/choose/artist", async function (req, res) {
  try {
    const data = await Artist.findAll();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json("Failed to get genre" + error);
  }
});
router.get("/admin/merchs", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 9;
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
router.get('/admin/image/merchandise', async function (req, res) {
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
router.get("/admin/detail/merchandise", async function (req, res) {
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

router.put("/admin/merchandise/update", upload.array('image', 5), async function (req, res) {
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
module.exports = router;
