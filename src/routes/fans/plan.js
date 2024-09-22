const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../../models/Fans");
const Plan = require("../../models/Plan");
const router = express.Router();

router.post("/fans/plan", async function (req, res) {
    const { id } = req.query;

    let highestIdEntry = await Plan.findOne({
      where: {
        id_plan: {
          [Op.like]: `${newIdPrefix}%`
        }
      },
      order: [[ 'id_plan', 'DESC' ]] 
    });
    let newIdNumber = 1;
    if (highestIdEntry) {
      let highestId = highestIdEntry.id_plan;
      let numericPart = highestId.replace(newIdPrefix, ''); 
      newIdNumber = parseInt(numericPart, 10) + 1;
    }
    let newIdPlan = newIdPrefix + newIdNumber.toString().padStart(3, '0');

    try {
        await Plan.create({
            id_plan: newIdPlan,
            id_fans: id,
            status: 1,
            created_at: Date.now()
        });
    } catch (error) {
        return res.status(400).send("create plan" + error);
    }
});
router.post('/plan/payment', async function (req, res) {
    
});
module.exports = router;