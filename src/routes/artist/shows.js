const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Artist = require("../../models/Artist");
const Shows = require("../../models/Shows");

const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const JWT_KEY = 'makeblackmetalhateagain';
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function name(req, file, cb) {
        cb(null, './public/assets/image/shows');
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
            const fullFilePath = path.join('assets', 'image', 'shows', fileName);
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
router.post('/shows/add', upload.single('image'), async function (req, res) {
    let { name, date, location, contact, description } = req.body;
    let { image } = req.file;

    const filePath = req.file.filename;
    
    const token = req.headers.authorization.split(' ')[1];
    let userdata = jwt.verify(token, JWT_KEY);

    let newIdPrefix = "SWHS";
    let keyword = `%${newIdPrefix}%`
    let similiarUID = await Shows.findAll({
        where: {
            id_show: {
                [Op.like]: keyword
            }
        }
    });
    let newIdShows = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');
    const newShows= await Shows.create({
        id_show: newIdShows,
        id_artist: userdata.id_artist,
        name: name,
        duedate:date,
        location: location,
        contact: contact,
        description:description,
        image: filePath,
        created_at: Date.now(),
        status: 1,
    });
    return res.status(201).send({message: "shows berhasil ditambahkan oleh " + userdata.name})
});
//SHOW ALL EVENT
router.get('/shows', async function (req, res) {
    const token = req.headers.authorization.split(' ')[1];
    // let token = req.header('x-auth-token');
    let userdata = jwt.verify(token, JWT_KEY);

    try {
        const data = await Shows.findAll({
            where: {
                id_artist: userdata.id_artist
            }
        });
        return res.status(200).json({
            data
        })
    } catch (err) {
        return res.status(400).send('gagal memuat data');
    }
});
module.exports = router;