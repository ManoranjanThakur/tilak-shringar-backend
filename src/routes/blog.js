const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const shortid = require("shortid");
const { requireSignin, adminMiddleware } = require("../common-middleware");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
} = require("../controller/blog");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
});

const router = Router();

router.post(
  "/blog",
  requireSignin,
  adminMiddleware,
  upload.single("coverImg"),
  createBlog
);
router.patch("/blog/:id", requireSignin, adminMiddleware, updateBlog);
router.delete("/blog/:id", requireSignin, adminMiddleware, deleteBlog);
router.get("/blog/all", requireSignin, adminMiddleware, getAllBlogs);
router.get("/blog/:id", requireSignin, adminMiddleware, getBlogById);

module.exports = router;
