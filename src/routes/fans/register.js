const nodemailer = require('nodemailer');
const crypto = require('crypto');
const express = require("express");
const { Op } = require("sequelize");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const Fans = require("../../models/Fans");
const Plan = require("../../models/Plan");

const router = express.Router();

const checkEmail = async (email) => {
  const dataCheck = await Fans.findOne({
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
  const dataCheck = await Fans.findOne({
    where: {
      username: {
        [Op.like]: username,
      },
    },
  });
  if ( dataCheck) {
    const error = new Error("Username already taken");
    error.path = "username"; 
    throw error; 
  }
  return username; 
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

router.post("/register/fans", async function (req, res) {
  let { email, password, username } = req.body;

  const schema = Joi.object({
    email: Joi.string().external(checkEmail).required(),
    username: Joi.string().min(4).external(checkUsername).pattern(new RegExp('^[a-z0-9]+$')).required(),
    password: Joi.string().min(6).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    confirm_password: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .options({ messages: { "any.only": "password does not match" } }),
  });

    try {
      await schema.validateAsync(req.body);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      let newIdPrefixFans = "FNS";
      let highestIdEntryFans = await Fans.findOne({
        where: {
          id_fans: {
            [Op.like]: `${newIdPrefixFans}%`
          }
        },
        order: [['id_fans', 'DESC']]
      });
      let newIdNumberFans = 1;
    if (highestIdEntryFans) {
      let highestIdFans = highestIdEntryFans.id_fans;
      let numericPartFans = highestIdFans.replace(newIdPrefixFans, ''); 
      newIdNumberFans = parseInt(numericPartFans, 10) + 1;
      }
      let newIdFans = newIdPrefixFans + newIdNumberFans.toString().padStart(3, '0');
      const passwordHash = bcrypt.hashSync(password, 10);

   let newIdPrefixPlan = "PLN";
    let highestIdEntryPlan = await Plan.findOne({
      where: {
        id_plan: {
          [Op.like]: `${newIdPrefixPlan}%`
        }
      },
      order: [[ 'id_plan', 'DESC' ]] 
    });
    let newIdNumberPlan = 1;
    if (highestIdEntryPlan) {
      let highestIdPlan = highestIdEntryPlan.id_plan;
      let numericPartPlan = highestIdPlan.replace(newIdPrefixPlan, ''); 
      newIdNumberPlan = parseInt(numericPartPlan, 10) + 1;
    }
    let newIdPlan = newIdPrefixPlan + newIdNumberPlan.toString().padStart(3, '0');
    await Plan.create({
       id_plan: newIdPlan,
       id_fans: newIdFans,
       status: 1,
       type: 'free',
       start: Date.now(),
       expired: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
       limit_listening: 5,
       created_at: Date.now()
     });
   
     const data = await Fans.create({
       id_fans: newIdFans,
       email: email,
       password: passwordHash,
       username: username,
       first_name: null,
       last_name: null,
       birth: null,
       phone: null,
       role: "fans",
       gender: null,
       avatar: null,
       created_at: Date.now(),
       verify_token: verificationToken,
       is_verified:0,
       verify_token_expired: verificationTokenExpiry,
       status: 1,
     });
      const verificationLink = `http://musickvlt.site/verify/fans/${verificationToken}`;
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
        message: "Successfully register as Fans, we're already sent verify email, please check it!",
        data : data
     });
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
router.get("/verify-fans-email/:token", async function (req, res) {
  try {
    const { token } = req.params;

    const user = await Fans.findOne({
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

    await Fans.update({
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
