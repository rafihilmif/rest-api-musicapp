const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const { subMonths } = require('date-fns');

const Album = require("../../models/Album");
const Song = require("../../models/Song");
const Artist = require("../../models/Artist");

const router = express.Router();
router.get("/albums", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 6;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Album.findAndCountAll({
      where: {
      status: 1
    }},{
      limit,
      offset,
      order: [[Sequelize.literal(`id_album`), "ASC"]],
      include: [
        {
          model: Artist,
          attributes: ["name"],
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
router.get("/album", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Album.findOne({
      where: {
        id_album: {
          [Op.like]: id,
        },
        status : 1
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
        },
      ],
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/collection/album", async function (req, res) {
  const { id, page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    if (!page && !pageSize) {
      const { rows, count } = await Album.findAndCountAll({
      where: {
        id_artist: id,
        status : 1
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
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
      const { rows, count } = await Album.findAndCountAll({
      where: {
          id_artist: id,
        status : 1
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
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
router.get("/collection/album/sort/new", async function (req, res) {
  const { id, page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    if (!page && !pageSize) {
      const { rows, count } = await Album.findAndCountAll({
      where: {
          id_artist: id,
        status : 1
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
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
      const { rows, count } = await Album.findAndCountAll({
      where: {
          id_artist: id,
        status : 1
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            id_artist: {
              [Op.like]: id,
            },
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
    }
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/collection/album/sort/old", async function (req, res) {
  const { id, page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    if (!page && !pageSize) {
      const { rows, count } = await Album.findAndCountAll({
      where: {
        id_artist: id,
        status : 1
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
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
      const { rows, count } = await Album.findAndCountAll({
      where: {
        id_artist: id,
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            id_artist: {
              [Op.like]: id,
            },
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
    }
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/album/song", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Song.findAll({
      where: {
        id_album: {
          [Op.like]: id,
        }, 
      },
     include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"]
        },
      ],
    });
    const totalSongs = data.length;
    return res.status(200).json({
      totalSongs,
      songs: data
    });
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/album/genre", async function (req, res) {
  const { name } = req.query;
  try {
    const data = await Album.findAll({
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            genre: {
              [Op.like] : name
            },
             status: 1
          }
        },
      ],
    order: Sequelize.literal('RAND()'),
    limit: 6
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('gagal memuat data album berdasarkan genre');
  }
});

router.get("/album/genre/old", async function (req, res) {
  const { name } = req.query;
  try {
    const data = await Album.findAll({
      include: [
        {
          model: Artist,
          attributes: ["name", "formed"],
          where: {
            genre: {
              [Op.like] : name
            },
            formed: {
              [Op.between]: [new Date('1990-01-01'), new Date('1999-12-31')]
            }
          }
        },  
      ],
    limit: 6
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('gagal memuat data album berdasarkan genre');
  }
});

router.get("/album/genre/new", async function (req, res) {
  const { name } = req.query;
  const oneMonthAgo = subMonths(new Date(), 1);
  try {
    const data = await Album.findAll({
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            genre: {
              [Op.like] : name
            }
          }
        },
        
      ],
      limit: 6
    }, {
      where: {
      created_at: {
                [Op.gte]: oneMonthAgo
            }
      }
    },
    );
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('gagal memuat data album berdasarkan genre');
  }
});

router.get("/result/album", async function (req, res) {
  const { name } = req.query;
  
  try {
    const matchingAlbums = await Album.findAll({
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

    const randomAlbums = await Album.findAll({
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            name: {
              [Op.notLike]: `%${name}%`
            },
             status: 1
          }
        }
      ],
      order: Sequelize.literal('RAND()'), 
      limit : 3
    });

    const data = [...matchingAlbums, ...randomAlbums];
    
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send(error);
  }
});
module.exports = router;
