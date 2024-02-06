const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../../models/Fans");
const Artist = require("../../models/Artist");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require('bcrypt');

const checkEmail = async (email) => {
    const artistEmail = await Artist.findOne(
        {
            where: {
                email: {
                    [Op.like]: email
                }
            }
        }
    );
    const fansEmail = await Fans.findOne(
        {
            where: {
                email: {
                    [Op.like] :email
                }
            }
        }
    )
    if (artistEmail || fansEmail) {
        throw new Error("email has been taken");
    }
}
const checkUsername = async (username) => {
    const artistUsername = await Artist.findOne(
        {
            where: {
                username: {
                    [Op.like]: username
                }
            }
        }
    );
    const fansUsername = await Fans.findOne(
        {
            where: {
                username: {
                    [Op.like] :username
                }
            }
        }
    )
     if (artistUsername || fansUsername) {
        throw new Error("username has been taken");
    }
}

router.post('/register/fans', async function (req, res) {
    let { email, password, confirm_password, username } = req.body;

    const schema = Joi.object({
        email: Joi.string().external(checkEmail).email({ minDomainSegments: 2, tlds: { allow: ['com'] } }).required(),
        username: Joi.string().external(checkUsername).required(),
        password: Joi.string().required(),
        confirm_password: Joi.any().valid(Joi.ref('password')).required().options({ messages: { 'any.only': 'password does not match'} })
    });
    let newIdPrefix = "FNS"
    let keyword = `%${newIdPrefix}%`;
    let similiarUID = await Fans.findAll(
        {
            where: {
                id_fans: {
                    [Op.like]: keyword
                }
            }
        }
    )
    try {
        await schema.validateAsync(req.body)
    } catch (error) {
        return res.status(400).send(error.toString())
    }
    let newIdFans = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');
     const passwordHash = bcrypt.hashSync(password, 10);
        const newFansAccount = await Fans.create({
            id_fans: newIdFans,
            email: email,
            password: passwordHash,
            username: username,
            first_name:null,
            last_name: null,
            birth:null,
            phone: null,
            role: "fans",
            gender: null,
            avatar: null,
            created_at: Date.now(),
            status:1
        });
        return res.status(201).send({
            "message" : "berhasil register"
        })
});
module.exports = router;