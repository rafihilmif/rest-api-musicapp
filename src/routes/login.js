const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../models/Fans");
const Artist = require("../models/Artist");
const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_KEY = "makeblackmetalhateagain";

router.post("/login", async function (req, res) {
  let { email, password } = req.body;
  const existFans = await Fans.findAll({
    where: {
      email: email,
    },
  });
  const existArtist = await Artist.findAll({
    where: {
      email: email,
    },
  });

  if (existArtist.length > 0) {
    const passwordArtist = await Artist.findAll({
      where: {
        email: email,
      },
    });
    let tempPassword = null;
    passwordArtist.forEach((element) => {
      tempPassword = element.password;
    });
    let passwordHashArtist = tempPassword;
    if (bcrypt.compareSync(password, passwordHashArtist)) {
      const tempDataArtist = await Artist.findOne({
        where: {
          email: email,
        },
      });
      let token = jwt.sign(
        {
          id_artist: tempDataArtist.id_artist,
          email: tempDataArtist.email,
          username: tempDataArtist.username,
          name: tempDataArtist.name,
          formed: tempDataArtist.formend,
          genre: tempDataArtist.genre,
          role: tempDataArtist.role,
          description: tempDataArtist.description,
          avatar: tempDataArtist.avatar,
          status: tempDataArtist.status,
        },
        JWT_KEY,
      );
      return res.status(200).send({
        message: "Successfully logged Artist " + email,
        token: token,
      });
    } else {
      return res.status(400).send({
        message: "Password salah, login gagal",
      });
    }
  } else if (existFans.length > 0) {
    const passwordFans = await Fans.findAll({
      where: {
        email: email,
      },
    });
    let tempPassword = null;
    passwordFans.forEach((element) => {
      tempPassword = element.password;
    });
    let passwordHashFans = tempPassword;
    if (bcrypt.compareSync(password, passwordHashFans)) {
      const tempDataFans = await Fans.findOne({
        where: {
          email: email,
        },
      });
      let token = jwt.sign(
        {
          id_fans: tempDataFans.id_fans,
          email: tempDataFans.email,
          username: tempDataFans.username,
          first_name: tempDataFans.first_name,
          last_name: tempDataFans.last_name,
          birth: tempDataFans.birth,
          phone: tempDataFans.phone,
          role: tempDataFans.role,
          gender: tempDataFans.gender,
          avatar: tempDataFans.avatar,
          status: tempDataFans.status,
        },
        JWT_KEY,
      );
      return res.status(200).send({
        message: "Successefully logged Fans " + email,
        token: token,
      });
    } else {
      return res.status(400).send({
        message: "Password salah, login gagal",
      });
    }
  } else {
    return res.status(404).send({
      message: "Data tidak valid, login gagal",
    });
  }
});

router.post("/auth/login", async function (req, res) {
  let { email, password } = req.body;
  const existFans = await Fans.findAll({
    where: {
      email: email,
    },
  });
  const existArtist = await Artist.findAll({
    where: {
      email: email,
    },
  });

  if (existArtist.length > 0) {
    const passwordArtist = await Artist.findAll({
      where: {
        email: email,
      },
    });
    let tempPassword = null;
    passwordArtist.forEach((element) => {
      tempPassword = element.password;
    });
    let passwordHashArtist = tempPassword;
    if (bcrypt.compareSync(password, passwordHashArtist)) {
      const tempDataArtist = await Artist.findOne({
        where: {
          email: email,
        },
      });
      let token = jwt.sign(
        {
          id_artist: tempDataArtist.id_artist,
          email: tempDataArtist.email,
          username: tempDataArtist.username,
          name: tempDataArtist.name,
          formed: tempDataArtist.formend,
          genre: tempDataArtist.genre,
          role: tempDataArtist.role,
          description: tempDataArtist.description,
          avatar: tempDataArtist.avatar,
          status: tempDataArtist.status,
        },
        JWT_KEY,
      );
      return res.status(200).send({
        message: "Successfully logged Artist " + email,
        token: token,
      });
    } else {
      return res.status(400).send({
        message: "Password salah, login gagal",
      });
    }
  } else if (existFans.length > 0) {
    const passwordFans = await Fans.findAll({
      where: {
        email: email,
      },
    });
    let tempPassword = null;
    passwordFans.forEach((element) => {
      tempPassword = element.password;
    });
    let passwordHashFans = tempPassword;
    if (bcrypt.compareSync(password, passwordHashFans)) {
      const tempDataFans = await Fans.findOne({
        where: {
          email: email,
        },
      });
      let token = jwt.sign(
        {
          id_fans: tempDataFans.id_fans,
          email: tempDataFans.email,
          username: tempDataFans.username,
          first_name: tempDataFans.first_name,
          last_name: tempDataFans.last_name,
          birth: tempDataFans.birth,
          phone: tempDataFans.phone,
          role: tempDataFans.role,
          gender: tempDataFans.gender,
          avatar: tempDataFans.avatar,
          status: tempDataFans.status,
        },
        JWT_KEY,
      );
      return res.status(200).send({
        message: "Successefully logged Fans " + email,
        accessToken: token,
      });
    } else {
      return res.status(400).send({
        message: "Password salah, login gagal",
      });
    }
  } else {
    return res.status(404).send({
      message: "Data tidak valid, login gagal",
    });
  }
});
