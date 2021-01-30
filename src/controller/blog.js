const Blog = require("../models/blog");

exports.createBlog = async (req, res) => {
  let { title, content } = req.body;
  let { _id } = req.user;
  let coverImg = req.file.filename;

  // if (req.files != null) {
  //   // productPictures = req.files.map((file) => {
  //   //   return { img: file.filename };
  //   // });

  console.log();
  // }

  try {
    let newBlog = await new Blog({
      title,
      content,
      createdBy: _id,
      coverImg,
    }).save();

    res.json(newBlog);
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.updateBlog = async (req, res) => {
  let id = req.params.id;
  let { title, content } = req.body;

  console.log(req.body);

  try {
    let updatedBlog = await Blog.findByIdAndUpdate(id, {
      $set: { title: title, content: content },
    });

    res.json(updatedBlog);
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.deleteBlog = async (req, res) => {
  let id = req.params.id;

  try {
    let deletedBlog = await Blog.findByIdAndDelete(id);

    res.json(deletedBlog);
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    let allBlogs = await Blog.find({});

    res.json(allBlogs);
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.getBlogById = async (req, res) => {
  let id = req.params.id;

  try {
    let oneBlog = await Blog.findById(id);

    res.json(oneBlog);
  } catch (error) {
    return res.status(400).json(error);
  }
};
