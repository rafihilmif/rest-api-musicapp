const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../../models/Fans");
const Merch = require("../../models/Merch");
const Cart = require("../../models/Cart");
const CartItem = require("../../models/CartItem");
const ImageMerch = require("../../models/ImageMerch");
const router = express.Router();

router.get("/fans/cart", async function (req, res) {
    const { id } = req.query;

    const cart = await Cart.findOne({
            where: {
                id_fans: {
                    [Op.like]: id
                }
            }
        });
        if (!cart) {
            return res.status(400).json({ message: "Tidak ada barang yang ditambahkan" });
    }
        const cartItems = await CartItem.findAll({
            where: {
                id_cart: {
                    [Op.like]: cart.id_cart
                }
            },
            include: [
                {
                    model: Merch,
                    attributes: ['name', 'price'],

                    include: [{
                        model: ImageMerch,
                        attributes: ['name'],
                        where: {
                            number: 1
                        }
                    }]
                }
            ]
        });
         res.status(200).json(cartItems);
    try {   
        
    } catch (error) {
        return res.status(400).send('gagal memuat data cart');
    }
});

router.post("/fans/cart", async function (req, res) {
    const { id_fans,id_merchandise, size, qty } = req.body; 
    
    try {
        if (!id_merchandise || !qty) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    let newIdPrefix = "CART";
    let keyword = `%${newIdPrefix}%`
    let similiarUID = await Cart.findAll({
        where: {
            id_cart: {
                [Op.like]: keyword
            }
        }
    });
    let newIdCart = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');
    
    let cart = await Cart.findOne({ where: { id_fans: id_fans } });
    if (!cart) {
        cart = await Cart.create({
            id_cart: newIdCart,
            id_fans: id_fans,
            created_at: Date.now(),
        });
    }
    const merch = await Merch.findByPk(id_merchandise);
    if (!merch) {
        return res.status(404).json({ message: 'merch not found' });
    }
    let cartItem = await CartItem.findOne({
        where: {
            id_cart: cart.id_cart,
            id_merchandise: id_merchandise,
            size: size || null
         }
    });
        
     if (cartItem) {
        cartItem.qty += qty;
        await cartItem.save();
     } else {
        let newIdPrefix = "CARTITM";
        let keyword = `%${newIdPrefix}%`
        let similiarUID = await CartItem.findAll({
        where: {
            id_cart_item: {
                [Op.like]: keyword
            }
        }
    });
    let newIdCartItem = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');
         cartItem = await CartItem.create({
             id_cart_item: newIdCartItem,
             id_cart: cart.id_cart,
                id_merchandise: id_merchandise,
                size: size || null,
                qty: qty,
                created_at: Date.now(),
            });
    }
    res.status(200).send(cartItem);
    } catch (error) {
        res.status(400).send('gagal menambahkan cart') ;
    }
});
module.exports = router;
