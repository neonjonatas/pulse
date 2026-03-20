import axios from 'axios'

export const loginInstance = axios.create({
  baseURL: process.env.BFF_BASE_URL,
  timeout: Number(process.env.BFF_API_TIMEOUT_MS)
})

loginInstance.interceptors.response.use((response) => response)
