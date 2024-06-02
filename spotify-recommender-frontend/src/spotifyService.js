import axios from 'axios';

const API_BASE_URL = 'https://my-spotify-recommender-app.herokuapp.com'; // Update with your Heroku app URL

export const getRecommendations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recommendations`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const authenticateWithSpotify = () => {
  window.location.href = `${API_BASE_URL}/auth/spotify`;
};
