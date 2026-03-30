import client from './client'

export const createOrder = (payload) =>
  client.post('/orders', payload).then(r => r.data.data)

export const getMyOrders = (restaurantId) =>
  client.get('/orders', { params: { restaurantId } }).then(r => r.data.data)

export const getOrderDetail = (orderId) =>
  client.get(`/orders/${orderId}`).then(r => r.data.data)
