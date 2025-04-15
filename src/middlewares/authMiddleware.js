const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const token =
    req.header("Authorization") && req.header("Authorization").split(" ")[1]; // Token comes as Bearer <token>

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, "your_secret_key");
    req.user = decoded; // Store the decoded information in the request object (user ID, email, etc.)
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authenticateToken;
