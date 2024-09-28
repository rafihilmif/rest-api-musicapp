const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../../models/Fans");
const Plan = require("../../models/Plan");
const PlanPayment = require("../../models/PlanPayment");
const midtransClient = require('midtrans-client');
const router = express.Router();

const snap = new midtransClient.Snap({
  isProduction: false, 
  serverKey: process.env.SERVER_KEY,
});
const coreClient = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.SERVER_KEY,
    clientKey: process.env.CLIENT_KEY
});
router.post("/fans/plan", async function (req, res) {
    const { id } = req.query;
   let newIdPrefixPlan = "PLN";
    let highestIdEntry = await Plan.findOne({
      where: {
        id_plan: {
          [Op.like]: `${newIdPrefixPlan}%`
        }
      },
      order: [[ 'id_plan', 'DESC' ]] 
    });
    let newIdNumber = 1;
    if (highestIdEntry) {
      let highestId = highestIdEntry.id_plan;
      let numericPart = highestId.replace(newIdPrefixPlan, ''); 
      newIdNumber = parseInt(numericPart, 10) + 1;
    }
    let newIdPlan = newIdPrefix + newIdNumber.toString().padStart(3, '0');

    try {
        await Plan.create({
            id_plan: newIdPlan,
            id_fans: id,
            status: 1,
            type: 'free',
            created_at: Date.now()
        });
    } catch (error) {
        return res.status(400).send("create plan" + error);
    }
});
router.post('/plan/payment', async function (req, res) {
  const { id } = req.query;
  const { amount, types} = req.body; 
  let newIdPrefixPlanPayment = "PLNPYMN";

  let dataFans = await Fans.findOne({
    where: {
      id_fans: id
    }
  });

  try {
    let highestIdEntryPlanPayment = await PlanPayment.findOne({
      where: {
        id_plan_payment: {
          [Op.like]: `${newIdPrefixPlanPayment}%`
        }
      },
      order: [['id_plan_payment', 'DESC']]
    });
    let newIdNumberPlanPayment = 1;
    if (highestIdEntryPlanPayment) {
      let highestIdPlanPayment = highestIdEntryPlanPayment.id_plan_payment;
      let numericPartPlanPayment = highestIdPlanPayment.replace(newIdPrefixPlanPayment, ''); 
      newIdNumberPlanPayment = parseInt(numericPartPlanPayment, 10) + 1;
    }
    let newIdPlanPlayment = newIdPrefixPlanPayment + newIdNumberPlanPayment.toString().padStart(3, '0');
  
    const transactionDetails = {
      transaction_details: {
        order_id: newIdPlanPlayment,
        gross_amount: amount,
      },
      customer_details: {
        first_name: dataFans.first_name,
        last_name: dataFans.last_name,
        email: dataFans.email,
        phone: dataFans.phone
      
      },
    };
    
    const transaction = await snap.createTransaction(transactionDetails);
    const snapToken = transaction.token;

    await PlanPayment.create({
      id_plan_payment: newIdPlanPlayment,
      id_fans: id,
      status: "Pending",
      type : types,
      total: amount,
      created_at: Date.now()
    });
    res.status(200).json({ token: snapToken });
  } catch (error) {
    console.error('Midtrans transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.get("/plan/payment", async function (req, res) {
  const { id, page, pageSize} = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;
   
  try {
  const { rows, count } = await PlanPayment.findAndCountAll({
      where: {
        id_fans: id,
      },
      limit,
      offset,
      order: [[Sequelize.literal(`created_at`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to get transaction' });
  }
});
router.get("/fans/detail/plan/payment", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await PlanPayment.findOne({
      where: {
        id_plan_payment: {
          [Op.like]: id
        }
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get tplan payment' });
  }
});
router.get("/plan/confirm/payment", async function (req, res) {
  const { idPlanPayment, idFans } = req.query;

  try {
    const checkPayment = await PlanPayment.findOne({
      where: {
        id_plan_payment: {
          [Op.like]: idPlanPayment
        }
      }
    });

    if (!checkPayment) {
      return res.status(400).json({ error: 'Failed to get plan payment' });
    }

    const response = await coreClient.transaction.status(checkPayment.id_plan_payment);
    res.json(response);

    if (response.transaction_status === 'settlement') {
      await PlanPayment.update(
        {
          status: "Settlement"
        },
        {
          where:
            { id_plan_payment: checkPayment.id_plan_payment }
        }
      );
      const startDate = new Date();
      const expiredDate = new Date();
      let planDuration = 0;
      let types = '';

      if (checkPayment.total === 66000) {
        planDuration = 1; 
        types = 'premium';
      } else if (checkPayment.total === 106000) {
        planDuration = 3; 
        types = 'deluxe';
      }
      expiredDate.setMonth(startDate.getMonth() + planDuration);
      await Plan.update(
        {
          start: startDate,
          expired: expiredDate,
          limit_listening: 99999,
          type : types
        },
        {
          where: {
            id_fans: idFans
          }
        }
      );
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;