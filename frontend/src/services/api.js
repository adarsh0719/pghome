// src/services/api.js
import axios from 'axios';

// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Set base URL
axios.defaults.baseURL = API_BASE_URL;

export default axios;
