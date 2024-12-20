const jwt = require("jsonwebtoken");
const express = require("express");
const { Op, Sequelize} = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const Playlist = require("../../models/Playlist");
const PlaylistSong = require("../../models/PlaylistSong");
const { func } = require("joi");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Artist = require("../../models/Artist");
const Fans = require("../../models/Fans");
const Song = require("../../models/Song");
const LikeSong = require('../../models/LikeSong');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/image/playlist");
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
  "/playlist/add",
  upload.single("image"),
  async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const { name} = req.body;

    const filePath = req.file.filename;

    try {
      const userdata = jwt.verify(token, process.env.JWT_KEY);
      const userId = userdata.id_fans || userdata.id_artist;  
      const newIdPlaylist = uuidv4().replace(/-/g, '');
      const data= await Playlist.create({
        id_playlist: newIdPlaylist,
        id_user: userId,
        name: name,
        image: filePath,
        created_at: Date.now(),
        status: 1,
      });
      return res.status(201).json({
        message: "Successfully added playlist ",
        data: data
       });
    } catch (error) {
      return res.status(400).json({ message: "Error added playlist" });
    }
    
  });

router.get("/playlist", async function (req, res) {
     const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
   
    try {
      if (token) {
         const userdata = jwt.verify(token, process.env.JWT_KEY);
        const userId = userdata.id_fans || userdata.id_artist;

        const data = await Playlist.findAll({
            where: {
                id_user: {
                [Op.notLike]: userId,
            },
              status: 1
          },
          limit: 5,
          order: Sequelize.literal('RAND()'), 
        });
        return res.status(200).json(data);
      }
      else {
         const data = await Playlist.findAll({
          limit: 5,
          order: Sequelize.literal('RAND()'), 
        });
        return res.status(200).json(data);
      }
  } catch (error) {
    return res.status(400).send('Failed to search for merchandise');
    }
});

router.get("/user/playlist", async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const userdata = jwt.verify(token, process.env.JWT_KEY);
        
      const userId = userdata.id_fans || userdata.id_artist;
  
      const data = await Playlist.findAll({
        where: {
          id_user: userId
        },
        limit: 6
      });

      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'No playlists found' });
      }

      return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        return res.status(500).json({
            message: 'Failed to fetch playlists',
            error: error.message
        });
    }
});

router.get("/user/detail/playlist", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const { id } = req.query;
  try {
    const data = await Playlist.findOne({
      where: {
        id_playlist: {
          [Op.like]: id
        }
      },
    });
    
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for merchandise');
  }
    
});

router.put("/user/update/playlist", upload.single('image'), async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const { id } = req.query;
  const newData = req.body;

  try {
    const playlist = await Playlist.findByPk(id);

    if (!playlist) {
      return res.status(404).send('Data not found');
    }

    Object.keys(newData).forEach((key) => {
      if (newData[key] !== undefined && key !== 'image') {
        playlist[key] = newData[key];
      }
    });
 
    if (req.file) {
      const oldFilePath = "./public/assets/image/playlist/" + playlist.image;
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });
      playlist.image = req.file.filename;
    }

    await playlist.save();

    return res.status(200).json({
       message: "Data playlist successfully updated",
    });
  } catch (error) {
    console.error('Failed to update data:', error);
    return res.status(400).send('Failed to update data');
  }
});
router.get("/detail/owner/playlist", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const { id } = req.query;
  if (id.includes("ART")) {
    const data = await Artist.findOne({
      where: {
        id_artist: {
          [Op.like]: id,
        },
      },
      attributes: {
        exclude: ["password", "created_at", "status", "formed", "genre", "role", "description"],
      },
    });
    return res.status(200).json(data);
  }
  else if (id.includes("FNS")) {
    const data = await Fans.findOne({
      where: {
        id_fans: {
          [Op.like]: id,
        },
      },
      attributes: {
        exclude: ["first_name", "last_name", "birth", "phone", "role", "gender", "password", "created_at", "status"],
      },
    });
    return res.status(200).json(data);
  } else {
    return res.status(404).json({ message: "Data not found" });
  }
});

router.get('/search/song/playlist', async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { q} = req.query;

  if (!q) {
    return res.status(400).send('Query parameter is missing');
  }
  try {
    const data = await Song.findAll({
      where: {
        name: {
          [Op.like]: `%${q}%`  
        },
      },
      include: [
        {
          model: Artist,
          where: {
            status: 1
          },
          attributes: ['name']
        }
      ],
      limit: 10
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Search error:', error);  
    return res.status(500).send('Failed to search tracks');
  }
});

router.post('/user/add/song/playlist', async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { idPlaylist, idSong } = req.query;

  let newIdPrefix = "PLYSNG";

  try {
    let highestIdEntry = await PlaylistSong.findOne({
      where: {
        id_playlist_song: {
          [Op.like]: `${newIdPrefix}%`
        }
      },
      order: [[ 'id_playlist_song', 'DESC' ]] 
    });
    let newIdNumber = 1;
    if (highestIdEntry) {
      let highestId = highestIdEntry.id_playlist_song;
      let numericPart = highestId.replace(newIdPrefix, ''); 
      newIdNumber = parseInt(numericPart, 10) + 1;
    }
    let newIdPlaylistSong = newIdPrefix + newIdNumber.toString().padStart(3, '0');
    const data = await PlaylistSong.create({
      id_playlist_song: newIdPlaylistSong,
      id_playlist: idPlaylist,
      id_song: idSong
    });

    return res.status(201).json({
      message: 'Song added to playlist successfully',
      data: data
     });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return res.status(500).json({ message: 'Error adding song to playlist' });
  }
});

router.get('/playlist/song', async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { id } = req.query;
  try {
    const data = await PlaylistSong.findAll({
      where: {
        id_playlist: {
          [Op.like]: id
        }
      },
      include: [
        {
          model: Song,
          where: {
            status: 1
          },
          attributes: ['id_song', 'name', 'image', 'audio'],
          include: [
            {
              model: Artist,
              attributes: ['name'], 
            }
          ]
        },
      ],
          order: [[Sequelize.literal(`id_playlist_song`), "ASC"]],
    });
   const totalSongs = data.length;
    return res.status(200).json({
      totalSongs,
      songs: data
    });
  } catch (error) {
    console.error('fetch data playlist song', error);
  }
});
router.delete('/user/playlist/song', async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

  const { id } = req.query;
  try {
    const deletedSong = await PlaylistSong.destroy({
      where: {
        id_playlist_song: id
      }
    });

    if (deletedSong) {
      res.status(200).json({ message: 'Song removed from playlist successfully' });
    } else {
      res.status(404).json({ message: 'Song not found in the playlist' });
    }
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: 'An error occurred while removing the song from the playlist' });
  }
});
router.get('/collection/playlist', async function (req, res) {
  const { id } = req.query;
    try {
        const data = await Playlist.findAll({
            where: {
                id_user: {
                    [Op.like]: id
                }
            },
            limit: 10
        });
    
        return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for merchandise');
    }
});

router.delete('/user/playlist', async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

  const { id } = req.query;

  try {
    await PlaylistSong.destroy({
      where: {
        id_playlist: id
      }
    });
    await Playlist.destroy({
      where: {
        id_playlist: id
      }
    });
    res.status(200).json({ message: 'Successfully removed playlist' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'An error occurred while removing the playlist' });
  }
});

router.delete('/user/playlist', async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { id } = req.query;
  try {
    const playlist = await Playlist.findOne({
      where: { id_playlist: id }
    });
    if (playlist) {
      
     const oldFilePath = "./public/assets/image/playlist/" + playlist.image;
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
      });

      await PlaylistSong.destroy({
        where: { id_playlist: id }
      });
      await Playlist.destroy({
        where: { id_playlist: id }
      });

      res.status(200).json({ message: 'Successfully removed playlist, associated songs, and image' });
    } else {
      res.status(404).json({ message: 'Playlist not found' });
    }
  } catch (error) {
    console.error('Error deleting playlist and associated data:', error);
    res.status(500).json({ message: 'An error occurred while removing the playlist' });
  }
});
router.post('/user/add/like/song', async function (req, res) {
  const { idUser, idSong } = req.query;

  let newIdPrefix = "LIKESNG";

  try {
    let highestIdEntry = await LikeSong.findOne({
      where: {
        id_like_song: {
          [Op.like]: `${newIdPrefix}%`
        }
      },
      order: [[ 'id_like_song', 'DESC' ]] 
    });
    let newIdNumber = 1;
    if (highestIdEntry) {
      let highestId = highestIdEntry.id_like_song;
      let numericPart = highestId.replace(newIdPrefix, ''); 
      newIdNumber = parseInt(numericPart, 10) + 1;
    }
    let newIdLikeSong = newIdPrefix + newIdNumber.toString().padStart(3, '0');
    await LikeSong.create({
      id_like_song: newIdLikeSong,
      id_user: idUser,
      id_song: idSong,
      created_at: Date.now(),
      status: 1,
    });

    return res.status(200).json({ message: 'Song added to like successfully' });
  } catch (error) {
    console.error('Error adding song to like:', error);
    return res.status(500).json({ message: 'Error adding song to like' });
  }
});
router.get('/user/like/song', async function (req, res) {
  const { id } = req.query;
  try {
    const data = await LikeSong.findAll({
      where: {
        id_user: {
          [Op.like]: id
        }
      },
      include: [
        {
          model: Song,
          attributes: ['id_song', 'name', 'image'],
          include: [
            {
              model: Artist,
              attributes: ['name'], 
            }
          ]
        },
      ],
          order: [[Sequelize.literal(`id_like_song`), "ASC"]],
    });
   const totalSongs = data.length;
    return res.status(200).json({
      totalSongs,
      songs: data
    });
  } catch (error) {
    console.error('fetch data like song', error);
  }
});
router.delete('/user/like/song', async function (req, res) {
  const { id } = req.query;
  try {
    const deletedSong = await LikeSong.destroy({
      where: {
        id_song: id
      }
    });

    if (deletedSong) {
      res.status(200).json({ message: 'Song removed from favorite successfully' });
    } else {
      res.status(404).json({ message: 'Song not found in the favorite' });
    }
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: 'An error occurred while removing the song from the favorite' });
  }
});
router.get('/search/song/like', async function (req, res) {
  const { q} = req.query;

  if (!q) {
    return res.status(400).send('Query parameter is missing');
  }
  try {
    const data = await Song.findAll({
      where: {
        name: {
          [Op.like]: `%${q}%` 
        },
      },
      include: [
        {
          model: Artist,
          attributes: ['name']
        }
      ],
      limit: 10
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Search error:', error);  
    return res.status(500).send('Failed to search tracks');
  }
});
router.get("/result/playlist", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { name } = req.query;
  
  try {
    const matchingPlaylist = await Playlist.findAll({
     where: {
            name: {
              [Op.like]: `%${name}%`
        },
       status: 1
       },
      order: Sequelize.literal('RAND()'), 
      limit: 3
    });

    const randomPlaylist = await Playlist.findAll({
     where: {
            name: {
              [Op.notLike]: `%${name}%`
        },
       status: 1
      },
      order: Sequelize.literal('RAND()'), 
      limit: 3 
    });

    const data = [...matchingPlaylist, ...randomPlaylist];
    
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for playlist');
  }
});
module.exports = router;
