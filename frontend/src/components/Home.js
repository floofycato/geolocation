import React, { useState, useEffect } from "react"
import axios from "axios"
import { useDispatch } from "react-redux"
import { logout } from "../store/authSlice"
import styles from "./Home.module.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

function Home() {
  const [ip, setIp] = useState("")
  const [geoData, setGeoData] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState("")
  const dispatch = useDispatch()

  const token = localStorage.getItem("token")

  useEffect(() => {
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

    fetchHistory()
  }, [token])

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/geo/${ip}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGeoData(response.data)
      setError("")
    } catch (err) {
      setError("Invalid IP address")
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleDeleteHistory = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/geo/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setHistory(history.filter((item) => item._id !== id)) // Update state after deletion
    } catch (err) {
      setError("Failed to delete history")
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Welcome to the Geolocation App</h2>
      <button onClick={handleLogout} className={styles.button}>
        Logout
      </button>

      <div>
        <input
          type="text"
          placeholder="Enter IP address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleSearch} className={styles.button}>
          Search
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {geoData && (
        <div className={styles.geoData}>
          <h3>Geolocation Data</h3>
          <pre>{JSON.stringify(geoData, null, 2)}</pre>
        </div>
      )}

      {geoData && geoData.geo_info.loc && (
        <MapContainer
          center={geoData.geo_info.loc.split(",").map(Number)}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={geoData.geo_info.loc.split(",").map(Number)}>
            <Popup>
              {geoData.geo_info.city}, {geoData.geo_info.region},{" "}
              {geoData.geo_info.country}
            </Popup>
          </Marker>
        </MapContainer>
      )}

      <h3>Search History</h3>
      <ul className={styles.history}>
        {history.map((item) => (
          <li key={item._id}>
            {item.ip_address} - {new Date(item.createdAt).toLocaleString()}
            <button
              onClick={() => handleDeleteHistory(item._id)}
              className={styles.button}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Home
