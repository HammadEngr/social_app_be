import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import AppError from "../utils/appError.js";
import AppResponse from "../utils/appResponse.js";
import Email from "../utils/email.js";

const generateHashedRefreshToken = async (payload) => {
  try {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
      expiresIn: process.env.REFRESH_TOKEN_EXP,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    return { refreshToken, hashedRefreshToken };
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const signup = async (req, res, next) => {
  try {
    // return;
    const {
      firstName,
      lastName,
      userName,
      dateOfBirth,
      email,
      password,
      confirmPassword,
      gender,
      role,
      TOC,
    } = req.body;

    // 1. check for required fields
    const is_all_fields =
      firstName ||
      lastName ||
      userName ||
      email ||
      password ||
      confirmPassword ||
      dateOfBirth ||
      gender ||
      TOC;
    if (!is_all_fields) {
      return next(new AppError("all fields are required", 400));
    }

    // 2. check for duplication
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("user already exists with this email", 409));
    }

    // 3. Hash the password and save using pre-save document middleware
    const newUser = new User({
      firstName,
      lastName,
      userName,
      dateOfBirth,
      TOC,
      email,
      password,
      confirmPassword,
      gender,
      role,
    });

    const savedUser = await newUser.save();
    if (!savedUser) {
      return next(new AppError("user can not created", 404));
    }

    // 4. activation token
    const activation_token = savedUser.createActivationToken();
    await savedUser.save({ validateBeforeSave: false });

    // console.log(activation_token);
    const activation_url = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/activate/${activation_token}`;

    await new Email(newUser, activation_url).send(
      "Account Activation",
      "welcome"
    );

    // sending response
    const resObject = {
      user: {
        firstName,
        lastName,
        id: savedUser._id,
      },
    };

    return new AppResponse(
      201,
      "Check your email and follow activation link to complete registeration",
      resObject
    ).send(res);
  } catch (error) {
    console.log(error);
    next(new AppError("server error occured"));
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const { token } = req.params;
    // find the user
    const user = await User.findOne({ activationToken: token });
    if (!user) {
      return next(new AppError("user not found", 404));
    }

    // check if token is valid
    const activationTokenExpires = user.activationTokenExpires;
    const isExpired = activationTokenExpires < Date.now();

    if (isExpired) {
      await User.findByIdAndDelete(user.id);
      return next(new AppError("Token expired", 404));
    }

    // update the user activation status in db
    await User.findByIdAndUpdate(user.id, {
      isActivated: true,
    });

    return new AppResponse(200, "user activated successfully").send(res);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired"));
    }
    return next(new AppError("something went wrong"));
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);

    // 1. check required fields
    if (!email || !password) {
      return next(new AppError("email and password is required", 400));
    }

    // 2. find the user
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) {
      return next(new AppError("Invalid Credentials", 404));
    }

    // 3. compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid Credentials", 401));
    }

    // console.log(isMatch);
    // 4. create JWT access token
    const tokenPayload = {
      userId: user.id,
      userName: `${user.firstName}${user.lastName}`,
      email: user.email,
    };
    const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXP,
    });

    // 5. create JWT refresh token
    const { refreshToken, hashedRefreshToken } =
      await generateHashedRefreshToken(tokenPayload);

    // save hashedRefreshToken in data base
    user.refreshToken = hashedRefreshToken;
    await user.save({ validateBeforeSave: false });

    // send response
    const resObject = {
      accessToken,
      refreshToken,
      user: { id: user._id, firstName: user.firstName, email: user.email },
    };

    return new AppResponse(200, "Signed in successfully", resObject).send(res);
  } catch (error) {
    console.log(error);
    next(new AppError("something wennt wrong"));
  }
};

export const signOut = async (req, res, next) => {
  try {
    // In a real application, you'd get the userId from an authenticated token
    // For this example, we'll assume the client sends the refresh token to be revoked
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("refresh token is required for logout", 400));
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      // If the refresh token is expired or invalid, still attempt to clear from client-side
      return new AppResponse(200, "logout successful").send(res);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError("user not found", 404));
    }

    // Compare to ensure it's the current valid refresh token
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (isMatch) {
      user.refreshToken = null;
      await user.save();
    }
    // If it doesn't match, it means the client sent an old/invalid one,
    // but we still want to confirm logout from client perspective.
    return new AppResponse(200, "logged out successfully").send(res);
  } catch (error) {
    next(new AppError("an unexpected server error occured", 500));
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("refresh token not found", 401));
    }

    // 1. verify the provided refresh token (non-hashed)
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError("invalid refresh token", 403));
    }

    // 2. compare refresh token with that saved in db
    const isMatched = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isMatched) {
      user.refreshToken = null;
      await user.save();
      return next(new AppError("compromised token", 403));
    }

    const tokenPayload = {
      userId: user.id,
      userName: `${user.firstName}${user.lastName}`,
      email: user.email,
    };
    const newAccessToken = jwt.sign(
      tokenPayload,
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXP }
    );

    const { refreshToken: newRefreshToken, hashedRefreshToken } =
      await generateHashedRefreshToken(tokenPayload);

    user.refreshToken = hashedRefreshToken;
    await user.save();

    const resObject = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    return new AppResponse(200, "refresh successfully", resObject).send(res);
  } catch (error) {
    return next(new AppError("something went wrong"));
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("user not found", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    let resetUrl;
    if (process.env.NODE_ENV === "development") {
      resetUrl = `${process.env.FRONT_END_BASE_URL}/recover/resetpassword/${resetToken}`;
    } else {
      resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/recover/resetpassword/${resetToken}`;
    }

    await new Email(user, resetUrl).send("Password Reset", "passwordReset");

    return new AppResponse(200, "success").send(res);
  } catch (error) {
    return next(new AppError("something went wrong"));
  }
};

export const checkResetTokenValidity = async (req, res, next) => {
  try {
    const { token } = req.params;
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new AppError("Invalid or expired token", 401));
    }
    return new AppResponse(200, "token is valid").send(res);
  } catch (error) {
    return next(new AppError("Something went wrong"));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or expired", 401));
    }

    user.password = req.body.password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    return new AppResponse(200, "Password reset successfully").send(res);
  } catch (error) {
    console.log(error);
    return next(new AppError());
  }
};
