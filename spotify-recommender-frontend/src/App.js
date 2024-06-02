import React, { useState } from 'react';
import { authenticateWithSpotify, getRecommendations } from './spotifyService';

function App() {
  const [recommendations, setRecommendations] = useState([]);

  const handleGetRecommendations = async () => {
    try {
      const data = await getRecommendations();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Recommendation App</h1>
        <button onClick={authenticateWithSpotify}>Log in with Spotify</button>
        <button onClick={handleGetRecommendations}>Get Recommendations</button>
        {recommendations.length > 0 && (
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>
                <a href={rec.url} target="_blank" rel="noopener noreferrer">
                  {rec.name} by {rec.artist}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>
    </div>
  );
}

export default App;
