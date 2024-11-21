import mongoose from "mongoose"

const searchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ip_address: { type: String, required: true },
  geo_info: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("SearchHistory", searchHistorySchema)
