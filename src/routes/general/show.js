
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Shows = require("../../models/Shows");

const router = express.Router();

router.get('/shows', async function (req, res) {
    try {
        const data = await Shows.findAll();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).send('gagal memuat data show');
    }
});
router.get('/detail/show', async function (req, res) {
    const { id } = req.query;
    try {
        const data = await Shows.findOne({
            where: {
                id_show: {
                    [Op.like]: id
                }
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).send('gagal memuat detail show');
    }
});
router.get("/result/show", async function (req, res) {
  const { name } = req.query;
  
  try {
   
    const matchingShows = await Shows.findOne({
      where: {
        name: {
          [Op.like]: `%${name}%`
        }
      }
    });
 
    const otherShows = await Shows.findAll({
      where: {
        name: {
          [Op.notLike]: `%${name}%`
        }
      },
      order: Sequelize.literal('RAND()'),
      limit: 5
    });
    
    const data = matchingShows ? [matchingShows, ...otherShows] : otherShows;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for show');
  }
});
module.exports = router;