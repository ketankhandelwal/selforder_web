import client from './client'

export const scanQr = (token) =>
  client.get(`/qr/scan/${token}`).then(r => r.data.data)
