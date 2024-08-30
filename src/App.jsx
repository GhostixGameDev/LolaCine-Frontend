import { useEffect, useState } from 'react';
import banner from './assets/images/banner.png';

function App() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    //Fetches all the proposals from the server
    fetch('http://localhost:3304/proposals')
      .then(response => {
        if (!response.ok) {
          throw new Error('ERROR: Failed to fetch, response was not OK');
        }
        return response.json();
      })
      .then(data => setMovies(data))
      .catch(error => console.error('Error fetching proposals:', error));
  }, []);

  const handleVote = (id) => {
    //Adds one vote for the specified id.
    fetch(`http://localhost:3304/votes/${id}`, { method: 'POST' })
      .then(response => {
        if (!response.ok) {
          throw new Error('ERROR: Failed to fetch, response was not OK');
        }
        return response.json();
      })
      .then(data => {
        console.log(data.message);
        //Refresh the data.
        fetch('http://localhost:3304/proposals')
          .then(response => response.json())
          .then(data => setMovies(data))
          .catch(error => console.error('Error re-fetching proposals: ', error));
      })
      .catch(error => console.error('Error sending votes: ', error));
  };

  return (
    <div className="container">
      <div className="banner">
        <img src={banner} alt="Banner" />
      </div>
      <div className="vote-grid">
        {movies.map((movie) => (
          //Automatically creates every movie frame with their respective data.
          <div key={movie.ID} className="movie">
            <div className="content">
              {movie.name}<br />
              {movie.votes} votes
            </div>
            <button onClick={() => handleVote(movie.ID)}>Votar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

