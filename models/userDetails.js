import mongoose from "mongoose";

const { Schema } = mongoose;

const userDetailsSchema = new Schema({
  profession: {
    type: String,
  },
  region: {
    type: String,
  },
  languages: {
    type: [String],
  },
  bio: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
  },
});

const UserDetails = mongoose.model("userDetails", userDetailsSchema);
export default UserDetails;
