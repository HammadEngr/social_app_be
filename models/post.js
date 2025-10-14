import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema({
  createdAt: {
    type: Date,
  },
  content: {
    type: String,
    required: true,
    minLength: [3, "Post must be atleast 10 characters long"],
  },
  tags: {
    type: [String],
  },
  feelings: {
    type: String,
  },
  picture: {
    type: String,
  },
  author: {
    type: mongoose.ObjectId,
    required: true,
  },
});

postSchema.pre("save", function (next) {
  const creation_date = Date.now();
  console.log(creation_date);
  this.createdAt = creation_date;
  next();
});

const Post = mongoose.model("post", postSchema);
export default Post;
