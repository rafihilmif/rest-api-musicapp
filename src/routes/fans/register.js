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
  const artistEmail = await Artist.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
  });
  const fansEmail = await Fans.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
  });
  if (artistEmail || fansEmail) {
    throw new Error("email has been taken");
  }
};
const checkUsername = async (username) => {
  const artistUsername = await Artist.findOne({
    where: {
      username: {
        [Op.like]: username,
      },
    },
  });
  const fansUsername = await Fans.findOne({
    where: {
      username: {
        [Op.like]: username,
      },
    },
  });
  if (artistUsername || fansUsername) {
    throw new Error("username has been taken");
  }
};

router.post("/register/fans", async function (req, res) {
  let { email, password, confirm_password, username } = req.body;

  const schema = Joi.object({
    email: Joi.string()
      .external(checkEmail)
      .email({ minDomainSegments: 2, tlds: { allow: ["com"] } })
      .required(),
    username: Joi.string().external(checkUsername).required(),
    password: Joi.string().required(),
    confirm_password: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .options({ messages: { "any.only": "password does not match" } }),
  });
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

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json(error.toString());
  }
  
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
    

   try {
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
   
     await Fans.create({
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
     })
     return res.status(201).json("Successfully register as Fans");
    } catch (error) {
        return res.status(400).send("create plan" + error);
  }
  
});
module.exports = router;
