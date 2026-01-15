import jwt from "jsonwebtoken";

export const generateAuthToken = (id) => {
    const token = jwt.sign(id, "zdGF0dXMiOnRydWUsInVzZXJfc291cmNlIjoiZXJwIiwidXNlcl9yb2xlIjoiU1RVREVOVCI", {
        expiresIn: "30d",
    });
    return token;
};
