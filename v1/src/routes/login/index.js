const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { RQuery } = require("../../setups/database/database.setup");
const app = require("express").Router();
const {
  updateProfile,
  updatePassword,
} = require("../../setups/query/query.profile");

// login API :- Allows users to log in with their email and password. It checks the provided credentials against the database and returns a JWT token upon successful login.
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await RQuery(`
      SELECT *
      FROM users
      WHERE email = '${email}' AND password = '${password}' AND role != 'Agency'
    `);

    if (user.length > 0) {
      return res
        .status(200)
        .json({ message: "Login successful", user: user[0] });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
});

// API to update profile by user id : => Enables users to update their profile information, including username, company name, email, and contact number. It requires authentication and returns a success message upon successful update.
app.put("/profile-update/:id", async (req, res) => {
  try {
    const { userName, companyName, email, contactNo } = req.body;
    if (!userName) {
      return res.status(400).json({ error: "User name is required" });
    }
    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!contactNo) {
      return res.status(400).json({ error: "Contact number is required" });
    }

    const response = await updateProfile(
      req.params.id,
      userName,
      companyName,
      email,
      contactNo
    );

    if (response.flag) {
      return res.status(200).send({
        status: true,
        message: "User Profile Updated Successfully",
        path: req.path,
        data: [],
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "User Profile Update Failed",
        error: response.message,
        path: req.path,
        data: [],
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
});

// TO update password:- Allows users to change their password. It checks the current password, and if it matches, updates the password with the new one.
app.put("/change-password/:id", async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ error: "currentPassword is required" });
  }
  if (!newPassword) {
    return res.status(400).json({ error: "newPassword is required" });
  }
  if (!confirmPassword) {
    return res.status(400).json({ error: "confirmPassword is required" });
  }

  try {
    const user = await RQuery(`
      SELECT password
      FROM users
      WHERE id = '${req.params.id}' 
    `);

    if (user[0].password === currentPassword) {
      const response = await updatePassword(req.params.id, newPassword);

      if (response.flag) {
        return res.status(200).send({
          status: true,
          message: "User Password Updated Successfully",
          path: req.path,
        });
      } else {
        return res.status(400).send({
          status: false,
          message: "User Password Update Failed",
          error: response.message,
          path: req.path,
        });
      }
    } else {
      return res
        .status(400)
        .json({ error: "current password is not matching" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
});

module.exports = app;
