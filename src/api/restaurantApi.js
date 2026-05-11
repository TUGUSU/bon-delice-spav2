const BASE_URL = 'http://localhost:5000/api'; //frontend request хийх болгонд

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { //Frontend-ээс backend REST API руу HTTP request
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

export const getRestaurants = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/restaurants${qs ? `?${qs}` : ''}`);
};

export const getRestaurantById = (id) => request(`/restaurants/${id}`);
export const createRestaurant = (body) =>
  request('/restaurants', { method: 'POST', body: JSON.stringify(body) });
export const updateRestaurant = (id, body) =>
  request(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteRestaurant = (id) =>
  request(`/restaurants/${id}`, { method: 'DELETE' });

export const getReviews = (restaurantId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/restaurants/${restaurantId}/reviews${qs ? `?${qs}` : ''}`);
};
export const createReview = (restaurantId, body) =>
  request(`/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
export const deleteReview = (restaurantId, reviewId) =>
  request(`/restaurants/${restaurantId}/reviews/${reviewId}`, { method: 'DELETE' });

export const getReservations = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/reservations${qs ? `?${qs}` : ''}`);
};
export const createReservation = (body) =>
  request('/reservations', { method: 'POST', body: JSON.stringify(body) });
export const updateReservation = (id, body) =>
  request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const cancelReservation = (id) =>
  request(`/reservations/${id}`, { method: 'DELETE' });
