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
    try {   
            const cart = await Cart.findOne({
            where: {
                id_fans: {
                    [Op.like]: id
                }
            }
        });
        if (!cart) {
            return res.status(400).json({ message: "Cart has been empty" });
        };
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
    
    const totalCartItems = await CartItem.count({
            distinct: true,
            col: 'id_cart_item',
            where: {
                id_cart: cart.id_cart
            }
    });

     const totalQtyItems = await CartItem.sum('qty', {
            where: {
                id_cart: cart.id_cart
            }
     });
    res.status(200).json({data: cartItems, totalItems: totalCartItems, totalQty: totalQtyItems});
    } catch (error) {
        return res.status(400).send('Failed to get data cart');
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
        return res.status(404).json({ message: 'produk tidak ditemukan' });
    }

    let cartItem = await CartItem.findOne({
        where: {
            id_cart: cart.id_cart,
            id_merchandise: id_merchandise,
            size: size || null
         }
    });
    let isGarment = ['S', 'M', 'L', 'XL'].includes(size);
        if (isGarment) {
            let availableStock;
            switch(size) {
                case 'S':
                    availableStock = merch.s;
                    break;
                case 'M':
                    availableStock = merch.m;
                    break;
                case 'L':
                    availableStock = merch.l;
                    break;
                case 'XL':
                    availableStock = merch.xl;
                    break;
                default:
                    return res.status(400).json({ message: 'Ukuran tidak valid' });
            }
            if (availableStock < qty) {
                return res.status(400).json({ message: 'Stock tidak mencukupi' });
            }
        } else {
            if (merch.stock < qty) {
                return res.status(400).json({ message: 'Stock tidak mencukupi' });
            }
        }
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
        res.status(200).json({
        message: "Successfully add merchandise to cart", 
        data: cartItem
    });
    } catch (error) {
        res.status(400).send('gagal menambahkan cart') ;
    }
});
router.put('/fans/cart', async function (req, res) {
    const { id } = req.query;
    const { qty } = req.body;

    try {
        let cartItem = await CartItem.findOne({
            where: {
                id_cart_item: id,
            }
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        let merch = await Merch.findOne({
            where: {
                id_merchandise: cartItem.id_merchandise         
            }
        });

        if (!merch) {
            return res.status(404).json({ message: 'Merchandise not found' });
        }

        let availableStock = 0;

        if (merch.s !== 0 || merch.m !== 0 || merch.l !== 0 || merch.xl !== 0) {
            const size = cartItem.size;
            switch (size) {
                case 'S':
                    availableStock = merch.s;
                    break;
                case 'M':
                    availableStock = merch.m;
                    break;
                case 'L':
                    availableStock = merch.l;
                    break;
                case 'XL':
                    availableStock = merch.xl;
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid size' });
            }
        } else {
            availableStock = merch.stock;
        }

        if (availableStock < qty) {
            return res.status(400).json({ message: `Not enough stock available${cartItem.size ? ' for size ' + cartItem.size : ''}` });
        }

        cartItem.qty = qty;
        await cartItem.save();

        res.status(200).json({ message: 'Cart updated successfully', cartItem });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'An error occurred while updating the cart' });
    }
});
router.delete("/fans/cart/item", async function (req, res) {
    const {id} = req.query;

    try {
        await CartItem.destroy({
            where: {
                id_cart_item: id
            }
        });
        return res.status(200).json("Item has been remove from cart")
    } catch (error) {
        res.status(400).send("Failed to remove cart item");
    }
});
module.exports = router;
