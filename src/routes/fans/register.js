const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../../models/Fans");
const Artist = require("../../models/Artist");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const Plan = require("../../models/Plan");

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

router.post("/register/fans", async function (req, res) {
  let { email, password, username } = req.body;

  const schema = Joi.object({
    email: Joi.string().external(checkEmail).email({ minDomainSegments: 2, tlds: { allow: ["com"] } }).required(),
    username: Joi.string().min(4).external(checkUsername).pattern(new RegExp('^[a-z0-9]+$')).required(),
    password: Joi.string().min(6).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    confirm_password: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .options({ messages: { "any.only": "password does not match" } }),
  });

    try {
      await schema.validateAsync(req.body);
      let newIdPrefixFans = "FNS";
    let highestIdEntryFans = await Fans.findOne({
      where: {
        id_fans: {
          [Op.like]: `${newIdPrefixFans}%`
        }
      },
      order: [[ 'id_fans', 'DESC' ]] 
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
       status: 1,
     });
      return res.status(201).json({
        message: "Successfully register as Fans",
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
module.exports = router;
