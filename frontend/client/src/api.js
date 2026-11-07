import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5011/api",
  withCredentials: true,
});

export default API;