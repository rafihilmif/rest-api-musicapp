const jwt = require("jsonwebtoken");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Fans = require("../../models/Fans");
const Plan = require("../../models/Plan");
const PlanPayment = require("../../models/PlanPayment");

const midtransClient = require('midtrans-client');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const snap = new midtransClient.Snap({
  isProduction: false, 
  serverKey: process.env.SERVER_KEY,
});
const coreClient = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.SERVER_KEY,
    clientKey: process.env.CLIENT_KEY
});

router.post('/plan/payment', async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }
  
  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const { amount, types} = req.body; 

  let dataFans = await Fans.findOne({
    where: {
      id_fans: userdata.id_fans
    }
  });

  try {

    let newIdPlanPlayment = uuidv4().replace(/-/g, '').substring(0, 7);
  
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
      id_fans: userdata.id_fans,
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
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }
  
  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const {page, pageSize, timeFilter} = req.query;
  const limit = pageSize || 12;
  const offset = (page - 1) * limit || 0;
  
  const currentDate = new Date();
    let whereClause = {
        id_fans: userdata.id_fans
    };

    switch (timeFilter) {
        case 'this month':
            whereClause.created_at = {
                [Op.gte]: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                [Op.lte]: currentDate
            };
            break;
        case 'last 3 months':
            whereClause.created_at = {
                [Op.gte]: new Date(currentDate.setMonth(currentDate.getMonth() - 3)),
                [Op.lte]: new Date()
            };
            break;
        case 'last 6 months':
            whereClause.created_at = {
                [Op.gte]: new Date(currentDate.setMonth(currentDate.getMonth() - 6)),
                [Op.lte]: new Date()
            };
            break;   
        default:
            break;
  }

  try {
  const { rows, count } = await PlanPayment.findAndCountAll({
      where: whereClause,
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
    res.status(400).json({ error: 'Failed to get plan payment' });
  }
});
router.get("/plan/confirm/payment", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }
  
  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const { idPlanPayment} = req.query;

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

      if (checkPayment.total === 66600) {
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
            id_fans: userdata.id_fans
          }
        }
      );
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/fans/plan/detail", async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }
  
  const userdata = jwt.verify(token, process.env.JWT_KEY);

  try {
    const data = await Plan.findOne({
      where: {
        id_fans: userdata.id_fans
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json("Cannot find plan");
  }
});
module.exports = router;