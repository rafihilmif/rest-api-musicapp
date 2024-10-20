const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Merch = require("../../models/Merch");
const Artist = require("../../models/Artist");
const Category = require("../../models/Category");
const ImageMerch = require("../../models/ImageMerch");

const router = express.Router();
router.get('/image/merchandise', async function (req, res) {
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

router.get("/merchandises", async function (req, res) {
   try {
     const data = await Merch.findAll({
       limit: 5,
       order: Sequelize.literal('RAND()'),
       include: 
        {
          model: Artist,
         attributes: ["name"],
         where: {
            status: 1
          }
        },
     });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/merchandise", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Merch.findOne({
      where: {
        id_artist: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/collection/merchandise", async function (req, res) {
  const { id, page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    if (!page && !pageSize) {
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
      limit : 6,
      order: [[Sequelize.literal(`name`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
    }
    else {
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
    }
    
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/collection/merchandise/sort/tshirt", async function (req, res) {
  const { id, page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
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
router.get("/collection/merchandise/sort/longsleeve", async function (req, res) {
  const { id, page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
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
router.get("/collection/merchandise/sort/zipper", async function (req, res) {
  const { id, page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
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
router.get("/collection/merchandise/sort/hoodie", async function (req, res) {
  const { id, page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
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
router.get("/collection/merchandise/sort/sweatshirt", async function (req, res) {
  const { id, page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
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
router.get("/collection/merchandise/sort/accessories", async function (req, res) {
  const { id, page, pageSize} = req.query;
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


router.get("/category", async function (req, res) {
  const { name } = req.query; 
  
  try {
    if (name) {
      const data = await Category.findAll({
        where: {
        name: {
      [Op.notLike]: name
      }
      }});
    return res.status(200).json(data);
    }
    else {
      const data = await Category.findAll();
    return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(400).json('gagal memuat data category');
  }
});
router.get("/detail/merchandise", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Merch.findOne({
      where: {
        id_merchandise: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data detail merchandise");
  }
});

router.get("/related/merchandise", async function (req, res) { 
  const { id } = req.query;

  try {
    const data = await Merch.findAll({
    where: {
      id_merchandise: {
      [Op.notLike]: id
        }
        ,
      status: 1
      },
      include: {
        model: Artist,
        where: {
          status: 1
        },
      },
    order: Sequelize.literal('RAND()'),
    limit: 10
    });
    
return res.json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data related merchandise");
  }
  
});
router.get("/result/merchandise", async function (req, res) {
  const { name } = req.query;
  
  try {
    const matchingMerchs = await Merch.findAll({
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            name: {
              [Op.like]: `%${name}%`
            },
            status: 1
          }
        }
      ],
      order: Sequelize.literal('RAND()'), 
      limit: 3
    });

    const randomMerchs = await Merch.findAll({
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            name: {
              [Op.notLike]: `%${name}%`
            }
            ,
            status: 1
          }
        }
      ],
      order: Sequelize.literal('RAND()'), 
      limit: 3 
    });

    const data = [...matchingMerchs, ...randomMerchs];
    
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for merchandise');
  }
});

router.get("/discover/artist/merchandise", async function (req, res) {
  const { id} = req.query;

  try {
    const data = await Merch.findAll({
      where: {
        id_artist: {
           [Op.notLike] : id
         }
      },
       include: 
        {
          model: Artist,
         attributes: ["name"],
         where: {
            status: 1
          }
        },
       limit: 5,
       order: Sequelize.literal('RAND()'),
      
     });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});

module.exports = router;
