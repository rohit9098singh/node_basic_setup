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
 const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, imageUrl } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, "User not found");
    }

    // If email is being updated, check if it's already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return response(res, 400, "Email is already in use by another account");
      }
    }

    // Prepare update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("name email imageUrl phone role");

    return response(res, 200, "Profile updated successfully", updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    return response(res, 500, "Internal server error", error.message);
  }
};


export { profile,updateProfile };
