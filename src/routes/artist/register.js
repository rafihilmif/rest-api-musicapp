const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../../models/Fans");
const Artist = require("../../models/Artist");
const router = express.Router();

const Joi = require("joi");
const bcrypt = require("bcrypt");

const checkEmail = async (email) => {
  const dataCheck = await Artist.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
  });
  if (dataCheck) {
    const error = new Error("Email already taken");
    error.path = "email"; 
    throw error; 
  }
  return email; 
};

const checkUsername = async (username) => {
  const dataCheck = await Artist.findOne({
    where: {
      username: {
        [Op.like]: username,
      },
    },
  });
  if (dataCheck) {
    const error = new Error("Username already taken");
    error.path = "username"; 
    throw error; 
  }
  return username; 
};

const checkName = async (name) => {
  const dataCheck = await Artist.findOne({
    where: {
      name: {
        [Op.like]: name,
      },
    },
  });
  if (dataCheck) {
    const error = new Error("name already taken");
    error.path = "name"; 
    throw error; 
  }
  return name; 
};

router.post("/register/artist", async function (req, res) {
  let { email, password, username, genre, name } = req.body;
  const schema = Joi.object({
    email: Joi.string().external(checkEmail).email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
    username: Joi.string().min(4).external(checkUsername).pattern(new RegExp('^[a-z0-9]+$')).required(),
    name: Joi.string().min(4).external(checkName).required(),
    genre: Joi.string().required(),
    password: Joi.string().min(6).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    confirm_password: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .options({ messages: { "any.only": "password does not match" } }),
  });
    try {
    await schema.validateAsync(req.body);
    let newIdPrefixArtist = "ART";
    let highestIdEntryArtist = await Artist.findOne({
      where: {
        id_artist: {
          [Op.like]: `${newIdPrefixArtist}%`
        }
      },
      order: [[ 'id_artist', 'DESC' ]] 
    });
    let newIdNumberArtist = 1;
    if (highestIdEntryArtist) {
      let highestIdArtist = highestIdEntryArtist.id_artist;
      let numericPartArtist = highestIdArtist.replace(newIdPrefixArtist, ''); 
      newIdNumberArtist = parseInt(numericPartArtist, 10) + 1;
    }
  let newIdArtist = newIdPrefixArtist + newIdNumberArtist.toString().padStart(3, '0');
  const passwordHash = bcrypt.hashSync(password, 10);
  const data = await Artist.create({
    id_artist: newIdArtist,
    email: email,
    name: name,
    password: passwordHash,
    username: username,
    formed: null,
    genre: genre,
    role: "artist",
    description: null,
    avatar: null,
    created_at: Date.now(),
    status: 1,
  });
      return res.status(201).json({
        message: "Successfully register as Artist",
        // data: data
       },
  );
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
module.exports = router;
