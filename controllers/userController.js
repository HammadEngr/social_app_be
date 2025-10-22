import UserDetails from "../models/userDetails.js";
import User from "../models/users.js";
import AppError from "../utils/appError.js";
import AppResponse from "../utils/appResponse.js";

export const addUserDetails = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const { profession, region, languages, bio } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      next(new AppError("User doest not exist", 404));
    }

    const userDetailsId = user.userDetails;

    if (!userDetailsId) {
      const newDetails = new UserDetails({
        profession,
        region,
        languages: [languages],
        bio,
        userId,
        profileImage: req.uploadedImages.profile_pic,
        coverImage: req.uploadedImages.cover_pic,
      });
      await newDetails.save();
      await User.findByIdAndUpdate(userId, { userDetails: newDetails.id });
    } else {
      await UserDetails.findByIdAndUpdate(userDetailsId, {
        profession,
        region,
        languages: [languages],
        bio,
        userId,
        profileImage: req.uploadedImages.profile_pic,
        coverImage: req.uploadedImages.cover_pic,
      });
    }

    return new AppResponse(200, "Updated successfully").send(res);
  } catch (error) {
    console.log(error);
    return next(new AppError("Something Went wrong", 500));
  }
};
