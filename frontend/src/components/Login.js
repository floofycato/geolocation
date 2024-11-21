import React, { useState } from "react"
import axios from "axios"
import { useDispatch } from "react-redux"
import { login } from "../store/authSlice"
import { useNavigate } from "react-router-dom"
import styles from "./Login.module.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password }
      )
      dispatch(login(response.data.token))
      navigate("/home")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
