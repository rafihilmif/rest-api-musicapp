const { response } = require("express");
const express = require("express");
const { Op, Sequelize, Model } = require("sequelize");
const Fans = require("../../models/Fans");

const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Follow = require("../../models/Follow");
const Artist = require("../../models/Artist");
const router = express.Router();

router.post("/follow", async function (req, res) {
    const { idFans, idArtist } = req.query;
    
    let newIdPrefix = "FLW";

    try {
    let highestIdEntry = await Follow.findOne({
      where: {
        id_follow: {
          [Op.like]: `${newIdPrefix}%`
        }
      },
      order: [[ 'id_follow', 'DESC' ]] 
    });
    let newIdNumber = 1;
    if (highestIdEntry) {
      let highestId = highestIdEntry.id_follow;
      let numericPart = highestId.replace(newIdPrefix, ''); 
      newIdNumber = parseInt(numericPart, 10) + 1;
    }
    let newIdFollow = newIdPrefix + newIdNumber.toString().padStart(3, '0');
    const data = await Follow.create({
        id_follow: newIdFollow,
        id_fans: idFans,
        id_artist: idArtist,
        created_at: Date.now(),
    });
        res.status(200).json({
            message: "Fans " + idFans + " Successfully follow " + idArtist,
            data: data
        });
    } catch (error) {
        return res.status(400).send('Failed follow');
    }
});
router.get("/follow/check", async function (req, res) {
    const { idFans, idArtist } = req.query;

    try {
        const followRecord = await Follow.findOne({
            where: {
                id_fans: {
                    [Op.like]: idFans
                },
                id_artist: {
                    [Op.like]: idArtist
                }
            }
        });

        if (followRecord) {
            return res.status(200).json({ isFollowed: true });
        } else {
            return res.status(200).json({ isFollowed: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});
router.get("/total/follower", async function (req, res) {
    const { id } = req.query;  
    try {
        const data = await Follow.count({
            where: {
                id_artist: id
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});
router.delete("/unfollow", async function (req, res) {
    const { idFans, idArtist } = req.query;

    try {
        await Follow.destroy({
            where: {
                id_fans: {
                    [Op.like]: idFans
                },
                id_artist: {
                    [Op.like]: idArtist
                }
            }
        });
        res.status(200).json('Successfully unfollowed artist');
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});
router.get("/fans/follow", async function (req, res) {
    const { id } = req.query;
    try {
        const artistFollowed = await Follow.findAll({
            where: {
                id_fans: {
                    [Op.like]: id
                }
            },
            order: Sequelize.literal('RAND()'),
            limit: 8
        });

        if (artistFollowed.length > 0) {
            let data = [];
            for (const hasBeenFollow of artistFollowed) {
                const artistData = await Artist.findOne({
                    where: {
                        id_artist: hasBeenFollow.id_artist
                    },
                    attributes: ["name", "avatar", "id_artist"],
                    
                });
                if (artistData) {
                    data.push(artistData);
                }
            }
            return res.status(200).json(data);
        } else {
            const randomArtists = await Artist.findAll({
                order: Sequelize.literal('RAND()'),
                limit: 8
            });
            return res.status(200).json(randomArtists);
    }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch followed artists' });
    }
});

module.exports = router;
