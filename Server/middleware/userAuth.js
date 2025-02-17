import jwt from "jsonwebtoken";

// authenticate users based on a JSON Web Token (JWT) stored in cookies.
// execute when hit the endpoint
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // get userId and add it to req.body
    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    next();
    // Executed controller function
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;
