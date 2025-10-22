import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, `First name must be atleast 3 characters long`],
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, `Last name must be atleast 3 characters long`],
  },
  userName: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, `Last name must be atleast 3 characters long`],
  },
  dateOfBirth: {
    type: Date,
    required: [true, "date of birth is required"],
  },
  gender: {
    type: String,
    required: [true, "gender is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be 8 characters long"],
    validate: {
      validator: function (value) {
        return validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        });
      },
      message: () =>
        "Password must contain numbers, symbols, upper and lower case alphabets",
    },
  },
  confirmPassword: {
    type: String,
    required: [true, "Confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "passwords should match",
    },
  },
  TOC: {
    type: Boolean,
    required: [true, "you must agree with terms and conditons"],
  },
  role: {
    type: [String],
    default: ["user"],
  },
  refreshToken: {
    type: String,
    required: false,
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  activationToken: String,
  activationTokenExpires: Date,
  posts: {
    type: [mongoose.Schema.ObjectId],
    ref: "Post",
  },
  userDetails: {
    type: mongoose.Schema.ObjectId,
    ref: "UserDetails",
  },
});

// DOCUMENT PRE SAVE MIDDLEWARE
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = null;
  }

  next();
});

// PASSWORD RESET TOKE
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  // hashed
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetToken = passwordResetToken;
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  console.log(this.passwordResetExpires);

  return resetToken;
};

// ACTIVATION TOKEN
userSchema.methods.createActivationToken = function () {
  const activationToken = crypto.randomBytes(32).toString("hex");
  const activationTokenExpires = Date.now() + 2 * 60 * 1000;
  this.activationToken = activationToken;
  this.activationTokenExpires = activationTokenExpires;
  return activationToken;
};

const User = mongoose.model("user", userSchema);

export default User;
