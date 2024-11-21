# Geolocation App

A modern and minimalist web application for managing and visualizing IP geolocation data.

## Features

- **Login System**: Authenticate users securely with JWT tokens.
- **Fetch Current IP**: Automatically fetches and displays the user's current IP address and geolocation data on login.
- **Search by IP**: Enter an IP address to fetch and display its geolocation data.
- **Interactive Map**: View the exact location of the IP address on an interactive map.
- **Search History**: Displays the history of searched IPs with options to:
  - **Re-search**: Click an item to display its geolocation data again.
  - **Delete**: Remove individual or multiple search history items.
  - **Refresh**: Reload the latest history from the database.
- **Responsive Design**: A clean, user-friendly interface styled for desktop and mobile screens.

---

## Technologies Used

### Frontend

- **React**: Core framework for building the user interface.
- **React-Leaflet**: Interactive maps for geolocation visualization.
- **Axios**: API requests to backend services.
- **CSS Modules**: Scoped and modular CSS for styling.

### Backend

- **Node.js**: JavaScript runtime for building the server.
- **Express.js**: Backend framework for REST API endpoints.
- **MongoDB**: Database for storing user search history.
- **JWT**: Authentication mechanism for secure user sessions.

---

### Prerequisites

- Node.js (v16 or above)
- MongoDB Atlas or local MongoDB instance
- API key for [IPinfo.io](https://ipinfo.io)
