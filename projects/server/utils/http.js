import axios from 'axios'

const defaultOptions = {
  timeout: 6000e3,
}

export const getAxiosInstance = options => {
  return axios.create({
    ...defaultOptions,
    ...options,
  })
}
