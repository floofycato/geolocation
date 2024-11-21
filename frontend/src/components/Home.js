import React, { useState, useEffect } from "react"
import axios from "axios"
import { useDispatch } from "react-redux"
import { logout } from "../store/authSlice"
import styles from "./Home.module.css"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet's missing default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Helper component to update the map view
const UpdateMapView = ({ location }) => {
  const map = useMap()
  useEffect(() => {
    if (location) {
      map.setView(location, 13) // Updates the map's center and zoom level
    }
  }, [location, map])
  return null
}

function Home() {
  const [ip, setIp] = useState("")
  const [geoData, setGeoData] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState("")
  const [selectedHistories, setSelectedHistories] = useState([])
  const dispatch = useDispatch()

  const token = localStorage.getItem("token")

  // Fetch the user's current IP and geolocation on page load
  useEffect(() => {
    const fetchCurrentIP = async () => {
      try {
        const response = await axios.get(
          `https://ipinfo.io/json?token=${process.env.REACT_APP_IPINFO_API_KEY}`
        )
        setIp(response.data.ip) // Set the current IP
        await handleSearch(response.data.ip) // Fetch geolocation for the current IP
      } catch (err) {
        console.error("Error fetching current IP:", err.message)
        setError(
          "Failed to fetch current IP. Please check your network connection or API key."
        )
      }
    }

    fetchCurrentIP()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/geo/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setHistory(response.data)
    } catch (err) {
      setError("Failed to load history")
    }
  }

  // Fetch search history on page load
  useEffect(() => {
    fetchHistory()
  }, [token])

  // Handle searching for geolocation by IP
  const handleSearch = async (searchIp) => {
    try {
      const ipToSearch = searchIp || ip // Use the provided IP or the entered IP
      const response = await axios.get(
        `http://localhost:5000/api/geo/${ipToSearch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const parsedGeoInfo = JSON.parse(response.data.geo_info) // Parse the geo_info string
      setGeoData({ ...response.data, geo_info: parsedGeoInfo })
      setError("")

      // Scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } catch (err) {
      setError("Invalid IP address")
    }
  }

  // Handle logout
  const handleLogout = () => {
    dispatch(logout())
  }

  // Handle deleting multiple histories
  const handleDeleteSelectedHistories = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/geo/history/delete-multiple",
        { ids: selectedHistories },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setHistory(
        history.filter((item) => !selectedHistories.includes(item._id))
      )
      setSelectedHistories([])
      setError("")
    } catch (err) {
      console.error("Error deleting selected histories:", err.message)
      setError("Failed to delete selected histories")
    }
  }

  // Handle checkbox toggle
  const toggleSelectedHistory = (id) => {
    setSelectedHistories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Welcome to the Geolocation App</h2>
      <div>
        <input
          type="text"
          placeholder="Enter IP address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className={styles.input}
        />
        <button onClick={() => handleSearch()} className={styles.button}>
          Search
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {geoData && (
        <div className={styles.geoData}>
          <h3>Geolocation Data</h3>
          <table className={styles.geoTable}>
            <tbody>
              <tr>
                <td>
                  <strong>IP Address:</strong>
                </td>
                <td>{geoData.ip_address}</td>
              </tr>
              <tr>
                <td>
                  <strong>City:</strong>
                </td>
                <td>{geoData.geo_info.city || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Region:</strong>
                </td>
                <td>{geoData.geo_info.region || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Country:</strong>
                </td>
                <td>{geoData.geo_info.country || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Location:</strong>
                </td>
                <td>{geoData.geo_info.loc || "N/A"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Hostname:</strong>
                </td>
                <td>{geoData.geo_info.hostname || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {geoData && geoData.geo_info?.loc?.includes(",") && (
        <MapContainer
          center={geoData.geo_info.loc.split(",").map(Number)}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
        >
          <UpdateMapView
            location={geoData.geo_info.loc.split(",").map(Number)}
          />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={geoData.geo_info.loc.split(",").map(Number)}>
            <Popup>
              {geoData.geo_info.city}, {geoData.geo_info.region},{" "}
              {geoData.geo_info.country}
            </Popup>
          </Marker>
        </MapContainer>
      )}

      <h3 className={styles.historyTitle}>Search History</h3>
      <ul className={styles.history}>
        <button onClick={fetchHistory} className={styles.button}>
          Refresh
        </button>
        {history.map((item) => (
          <li key={item._id} className={styles.historyItem}>
            <input
              type="checkbox"
              onChange={() => toggleSelectedHistory(item._id)}
              checked={selectedHistories.includes(item._id)}
            />
            <span
              onClick={() => handleSearch(item.ip_address)}
              style={{ cursor: "pointer", marginLeft: "10px" }}
            >
              {item.ip_address} - {new Date(item.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      {selectedHistories.length > 0 && (
        <button
          onClick={handleDeleteSelectedHistories}
          className={styles.delete}
        >
          Delete Selected
        </button>
      )}
      <button onClick={handleLogout} className={styles.logout}>
        Logout
      </button>
    </div>
  )
}

export default Home
