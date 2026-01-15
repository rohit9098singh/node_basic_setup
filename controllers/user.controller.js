import UserSchema from "../models/user-models.js";

const profile = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await UserSchema.findById(id).select(
      "-__v -createdAt -updatedAt -password"
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile",
      data: user,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export { profile };
