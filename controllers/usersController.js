import User from "../models/users.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.find({ _id: id });
    if (user) {
      return res.status(200).json({
        success: true,
        message: "user found",
        user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "user deleted",
    });
  } catch (error) {
    console.log("error deleting user", error.message);
    res.status(500).json({
      success: false,
      message: "server error occured",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    if (allUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no user found",
      });
    }
    return res.status(500).json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};
