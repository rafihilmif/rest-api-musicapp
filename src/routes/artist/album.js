const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Album = require("../../models/Album");

const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const JWT_KEY = 'makeblackmetalhateagain';
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function name(req, file, cb) {
         cb(null, './public/assets/image/album');
    },
    fileFilter: function name(req, file, cb) {
        if (file.mimetype == "image/png"
            || file.mimetype == "image/jpg"
            || file.mimetype == "image/jpeg"
            || file.mimetype == "image/gif") {
            cb(null, true);
        } else {
            cb(null, false);
            cb(new Error('Only .png, .gif, .jpg and .jpeg format allowed!'));
        }
    },
    filename: function name(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        cb(null, fileName);
        req.on('aborted', () => {
            const fullFilePath = path.join('assets', 'image', 'album', fileName);
            file.stream.on('end', () => {
                fs.unlink(fullFilePath, (err) => {
                    console.log(fullFilePath);
                    if (err) {
                        throw err;
                    }
                });
            });
            file.stream.emit('end');
        })
    }

});

const upload = multer({ storage: storage });
router.post('/album/add', upload.single('image'), async function (req, res) {
    let { name, description } = req.body;
    let { image } = req.file;

    const paths = `${req.protocol}://${req.get('host')}/assets/image/album/${req.file.filename}`;
    const filePath = req.file.filename;
    
    const token = req.headers.authorization.split(' ')[1];
    let userdata = jwt.verify(token, JWT_KEY);

    let newIdPrefix = "ALBM";
    let keyword = `%${newIdPrefix}%`
    let similiarUID = await Album.findAll({
        where: {
            id_album: {
                [Op.like]: keyword
            }
        }
    });
    let newIdAlbum = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');
    const newAlbum = await Album.create({
        id_album: newIdAlbum,
        id_artist: userdata.id_artist,
        name: name,
        description: description,
        image: filePath,
        created_at: Date.now(),
        status: 1,
    });
    return res.status(201).send({message: "album berhasil ditambahkan oleh " + userdata.name})
});
// SHOW ALL ALBUM
router.get('/album', async function (req, res) {
    const token = req.headers.authorization.split(' ')[1];
    // let token = req.header('x-auth-token');
    let userdata = jwt.verify(token, JWT_KEY);

    try {
        const data = await Album.findAll({
            where: {
                id_artist: userdata.id_artist
            },
            include: [
                {
                    model: Artist, attributes: ['id_artist', 'name'],
                    where: {
                        'id_artist': {
                            [Op.like] : userdata.id_artist
                        }
                    }
                }
            ],
        });
        
        return res.status(200).json({
            data
        })
    } catch (err) {
        return res.status(400).send('gagal memuat data');
    }
});
module.exports = router;