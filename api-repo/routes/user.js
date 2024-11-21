import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import User from "../models/User.js"

const router = express.Router()

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    // Find the user in the database
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: "User not found" })

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" })

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })
    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
