const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");
require("dotenv").config();

const Order = require("../models/order");
const Cart = require("../models/cart");
const Address = require("../models/address");

paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    let totalAmount = 0;
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "cartItems.product",
      "name price quantity description"
    );

    cart.cartItems.forEach((prod) => {
      // console.log(product);
      totalAmount += prod.product.price * prod.quantity;
    });

    // console.log(totalAmount);

    if (req.body.paymentMethod === "razor") {
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      const options = {
        amount: parseInt(totalAmount) * 100,
        currency: req.body.currency,
      };

      instance.orders.create(options, function (err, order) {
        if (!err) {
          return res.status(200).json(order);
        } else {
          throw err;
        }
      });
    } else if (req.body.paymentMethod === "paypal") {
      //TODO create paypal

      let item_list = cart.cartItems.map((item) => {
        return {
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          currency: req.body.currency,
        };
      });

      console.log(item_list);

      const create_payment_json = {
        intent: "SALE",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:2000/api/addOrders",
          cancel_url: "http://localhost:2000/api/addOrders?cancel=true",
        },
        transactions: [
          {
            item_list: {
              items: item_list,
            },
            amount: {
              currency: req.body.currency,
              total: parseFloat(totalAmount),
            },
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          return res.json(error);
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              return res.json({ redirect_uri: payment.links[i].href });
            }
          }
        }
      });
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.addOrder = (req, res) => {
  console.log(req);
  if (req.query.cancel === "true") {
    return res.json({ success: false });
  }

  res.json({ success: true });

  // Cart.deleteOne({ user: req.user._id }).exec((error, result) => {
  //   if (error) return res.status(400).json({ error });
  //   if (result) {
  //     req.body.user = req.user._id;
  //     req.body.orderStatus = [
  //       {
  //         type: "ordered",
  //         date: new Date(),
  //         isCompleted: true,
  //       },
  //       {
  //         type: "packed",
  //         isCompleted: false,
  //       },
  //       {
  //         type: "shipped",
  //         isCompleted: false,
  //       },
  //       {
  //         type: "delivered",
  //         isCompleted: false,
  //       },
  //     ];
  //     const order = new Order(req.body);
  //     order.save((error, order) => {
  //       if (error) return res.status(400).json({ error });
  //       if (order) {
  //         res.status(201).json({ order });
  //       }
  //     });
  //   }
  // });
};

exports.getOrders = (req, res) => {
  Order.find({ user: req.user._id })
    .select("_id paymentStatus paymentType orderStatus items")
    .populate("items.productId", "_id name productPictures")
    .exec((error, orders) => {
      if (error) return res.status(400).json({ error });
      if (orders) {
        res.status(200).json({ orders });
      }
    });
};

exports.getOrder = (req, res) => {
  Order.findOne({ _id: req.body.orderId })
    .populate("items.productId", "_id name productPictures")
    .lean()
    .exec((error, order) => {
      if (error) return res.status(400).json({ error });
      if (order) {
        Address.findOne({
          user: req.user._id,
        }).exec((error, address) => {
          if (error) return res.status(400).json({ error });
          order.address = address.address.find(
            (adr) => adr._id.toString() == order.addressId.toString()
          );
          res.status(200).json({
            order,
          });
        });
      }
    });
};
