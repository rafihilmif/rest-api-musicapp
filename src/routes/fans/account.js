const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const Fans = require("../../models/Fans");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/image/avatar");
  },
  fileFilter: function name(req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only .png, .gif, .jpg and .jpeg format allowed!"));
    }
  },
  filename: function name(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, fileName);
    req.on("aborted", () => {
      const fullFilePath = path.join("assets", "image", "avatar", fileName);
      file.stream.on("end", () => {
        fs.unlink(fullFilePath, (err) => {
          console.log(fullFilePath);
          if (err) {
            throw err;
          }
        });
      });
      file.stream.emit("end");
    });
  },
});

const upload = multer({ storage: storage });

router.get("/detail/fans", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const userdata = jwt.verify(token, process.env.JWT_KEY);
    if (userdata.role != 'fans') {
     return res.status(401).json({ message: 'you are not fans' });
    }
    const data = await Fans.findOne({
      where: {
        id_fans: userdata.id_fans,
      },
      attributes: {
        exclude: ["password", "created_at", "status"],
      },
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
});

router.put("/account/fan", upload.single("image"), async function (req, res) {
  const { email } = req.query;
  const { old_password, new_password, ...newData } = req.body;
  try {
    const fan = await Fans.findOne({
      where: {
        email: {
          [Op.like]: email
        }
      }
    });

    if (!fan) {
      return res.status(404).send("Data tidak ditemukan");
    }
     if (old_password && new_password) {
       const isPasswordValid = bcrypt.compareSync(old_password, fan.password);
      if (!isPasswordValid) {
        return res.status(401).send("Old password is incorrect");
      }
      const passwordHash = bcrypt.hashSync(new_password, 10);
      newData.password = passwordHash;
     }
    
    const saveNewUpdateData = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== undefined) {
        saveNewUpdateData[key] = newData[key];
      }
    });

    if (req.file) {

      if (fan.avatar) {
        const oldFilePath = "./public/assets/image/avatar/" + fan.avatar;
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting the old image:", err);
            return res.status(500).send("Error deleting the old image");
          }
        });
      }
      saveNewUpdateData.avatar = req.file.filename;
    }

    await fan.update(saveNewUpdateData);
    return res.status(200).send("Data successfully updated");
  } catch (error) {
    console.error("Error updating data:", error);
    return res.status(400).send("Gagal merubah data");
  }
});

module.exports = router;
