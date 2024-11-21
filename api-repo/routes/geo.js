import express from "express"
import axios from "axios"
import jwt from "jsonwebtoken"
import SearchHistory from "../models/SearchHistory.js"

const router = express.Router()

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "Unauthorized" })

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" })
    req.user = user
    next()
  })
}

// Retrieve search history
router.get("/history", auth, async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user.id }).sort({
      createdAt: -1,
    })
    res.json(history)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Fetch geolocation and save to history
router.get("/:ip", auth, async (req, res) => {
  const { ip } = req.params

  try {
    // Validate IP address
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.([0-9]{1,3}\.){2}[0-9]{1,3}$/
    if (!ipRegex.test(ip))
      return res.status(400).json({ message: "Invalid IP address" })

    // Fetch geolocation data
    const { data } = await axios.get(`https://ipinfo.io/${ip}/geo`)
    const geoInfo = JSON.stringify(data)

    // Save the IP and geolocation to the database
    const history = new SearchHistory({
      userId: req.user.id,
      ip_address: ip,
      geo_info: geoInfo,
    })
    await history.save()

    res.json(history)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete multiple search history entries
router.post("/history/delete-multiple", auth, async (req, res) => {
  try {
    console.log("Request body:", req.body) // Debug log
    const { ids } = req.body
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" })
    }

    await SearchHistory.deleteMany({ _id: { $in: ids } })
    res.json({ message: "Selected histories deleted successfully" })
  } catch (error) {
    console.error("Error deleting multiple histories:", error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
