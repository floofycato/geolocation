import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.js"

dotenv.config()
;(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB Atlas")

    // Create a test user
    const user = new User({
      email: "test@example.com",
      password: "password123",
    })
    await user.save()
    console.log("User added!")

    mongoose.disconnect()
  } catch (error) {
    console.error("Error seeding data:", error)
  }
})()
