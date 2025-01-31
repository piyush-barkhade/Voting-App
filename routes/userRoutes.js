const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require("./../jwt.js");
const User = require("./../models/user.js");

router.post("/signup", async (req, res) => {
  try {
    const data = req.body;

    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    const existingUser = await User.findOne({
      aadharCardNum: data.aadharCardNum,
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with same Aadhar Card number already exists" });
    }

    const newUser = new User(data);

    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id,
    };
    const token = generateToken(payload);
    console.log("token generated", token);

    res.status(200).json({ response: response, token: token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { aadharCardNum, password } = req.body;

    const user = await User.findOne({ aadharCardNum: aadharCardNum });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    res.json({ token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;

    const userId = userData.id;
    const user = await User.findById(userId);

    res.status(200).json({ user });
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const { currPassword, newPassword } = req.body;

    const user = await User.findOne(userId);

    if (!user || !(await user.comparePassword(currPassword))) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    user.password = newPassword;
    await user.save();
    console.log("Password Updated");

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json({ e: "internal server error" });
  }
});

module.exports = router;
