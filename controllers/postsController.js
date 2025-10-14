import Post from "../models/post.js";
import User from "../models/users.js";
import AppError from "../utils/appError.js";
import AppResponse from "../utils/appResponse.js";

export const createPost = async (req, res, next) => {
  try {
    console.log(req.body);
    const { content, tags, feelings, picture, authorId } = req.body;

    // CREATE NEWPOST
    const newPost = new Post({
      content,
      tags,
      feelings,
      picture,
      author: authorId,
    });

    // IF ERROR
    const savedPost = await newPost.save();
    if (!savedPost) {
      throw new AppError("Post can not created", 404);
    }

    // UPDATE USER WITH POST ID
    await User.findByIdAndUpdate(authorId, { $push: { posts: newPost._id } });

    // SEND RESPONSE
    return new AppResponse(200, "post created successfully").send(res);
  } catch (error) {
    console.log(error);
    return next(new AppError("something went wrong", 500));
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return next(new AppError("post not found", 404));
    }

    return new AppResponse(200, "deleted successfully").send(res);
  } catch (error) {
    console.log(error);
    return next(new AppError("something went wrong", 500));
  }
};

export const editPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, tags, feelings, picture } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return next(new AppError("post does not exists", 404));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { content, tags, feelings, picture },
      { new: true }
    );

    return new AppResponse(200, "updated successfully").send(res);
  } catch (error) {
    console.log(error);
    return next(new AppError("something went wrong", 500));
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    // USER NOT FOUND
    if (!user) {
      return next(new AppError("user not found", 404));
    }

    // GETTING ALL POSTS AND SORTING IN DESCENDING ORDER
    const posts = await Post.find({ _id: { $in: user.posts } }).sort({
      createdAt: -1,
    });

    // IF POSTS DOES NOT EXIST
    if (posts.length === 0) {
      return next(new AppError("no posts found", 404));
    }

    // RETURN RESPONSE
    return new AppResponse(200, "All posts retrieved", posts).send(res);
  } catch (error) {
    console.log(error);
    return next(new AppError("something went wrong", 500));
  }
};
