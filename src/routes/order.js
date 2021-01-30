const { requireSignin, userMiddleware } = require("../common-middleware");
const {
  addOrder,
  getOrders,
  getOrder,
  createOrder,
} = require("../controller/order");
const router = require("express").Router();

router.post("/createOrder", requireSignin, userMiddleware, createOrder);
router.post("/addOrder", requireSignin, userMiddleware, addOrder);
router.get("/getOrders", requireSignin, userMiddleware, getOrders);
router.post("/getOrder", requireSignin, userMiddleware, getOrder);

module.exports = router;
