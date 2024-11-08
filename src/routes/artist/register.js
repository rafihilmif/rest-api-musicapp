const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

router.post("/register/artist", async function (req, res) {
  let { email, password, username, genre, name } = req.body;
  const schema = Joi.object({
    email: Joi.string().external(checkEmail).required(),
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
      await schema.validateAsync(req.body)

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
      await Artist.create({
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
        verify_token: verificationToken,
        is_verified: 0,
        verify_token_expired: verificationTokenExpiry,
        created_at: Date.now(),
        status: 1,
      });
      const verificationLink = `http://musickvlt.site/verify/artist/${verificationToken}`;
      await transporter.sendMail({
        from: `${process.env.EMAIL_FROM}`,
        to: email,
        subject: 'Verify Your Email - Musickvlt',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Musickvlt!</h2>
            <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
            <div style="margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #D1E9F6; 
                        color: #000; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `
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

router.get("/verify-artist-email/:token", async function (req, res) {
  try {
    const { token } = req.params;

    const user = await Artist.findOne({
      where: {
        verify_token: token,
        verify_token_expired: {
          [Op.gt]: new Date()
        },
        is_verified: 0
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    await Artist.update({
      is_verified: 1,
      verify_token: null,
      verify_token_expired: null
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in."
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      success: false,
      message: "Email verification failed. Please try again."
    });
  }
});
module.exports = router;
