import client from './client'

export const getMenu = (restaurantId) =>
  client.get(`/menu/${restaurantId}`).then(r => r.data.data)
