import UserSchema from "../models/user-models.js";
import { generateAuthToken } from "../services/token.js";
const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if email is already is there in db
        const isExist = await UserSchema.find({ email: email });
        if (isExist.length > 0) {
            return res
                .status(400)
                .json({ message: "Email already exists", success: false });
        }

        // Save user to db

        const user = new UserSchema({
            name: name,
            email: email,
            password: password,
        });

        const result = await user.save();

        return res.status(200).json({
            message: "User created successfully",
            success: true,
            data: result,
        });
    } catch (error) {
        new Error(error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const isExist = await UserSchema.findOne({ email: email }).select("-__v -createdAt -updatedAt")
        if (!isExist) {
            return res
                .status(400)
                .json({ message: "Email does not exists", success: false });
        }

        // Password match
        if (isExist.password !== password) {
            return res
                .status(400)
                .json({ message: "Password does not match", success: false });
        }

        return res.status(200).json({
            message: "User logged in successfully",
            success: true,
            data: {
                // profile: isExist,
                token: generateAuthToken({ id: isExist._id }),
            },
        });
    } catch (error) {
        new Error(error);
    }
};

export { signup, login };
