// api.ts
import axios from "axios";

const API_URL = "https://gaza-impact-backend.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});