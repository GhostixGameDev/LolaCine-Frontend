import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import LoadingScreen from './Loading';
import banner from './assets/images/banner.png';


function areCookiesEnabled() {
  document.cookie = "testcookie=1";
  const cookiesEnabled = document.cookie.indexOf("testcookie") !== -1;
  document.cookie = "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  return cookiesEnabled;
}

function App() {
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchMovies(user);
      }
    });
    return () => unsubscribe();
  }, []);

//============================================================================================
  //Proposals refreshing
  const fetchMovies = async (user) => {
    try {
      // Fetches all the proposals from the server
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3304/proposals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('ERROR: Failed to fetch, response was not OK');
      }
      const data = await response.json();
      setMovies(data);
    }catch (error){
      console.error('Error fetching proposals:', error);
    }
  };

//============================================================================================
  // Google sign in
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try{
      await signInWithPopup(auth, provider);
    }catch (error){
      console.error("Error signing in with Google", error);
    }
  };
//============================================================================================
  // Vote emission
  const handleVote = async (id) => {
    if (!user) {
      alert("¡Debes iniciar sesión para votar!");
      return;
    }
    if(!areCookiesEnabled()){ 
      // Display error message if cookies not enabled.
      alert("Debes tener las cookies habilitadas para votar.")
      return;}
    // Adds one vote for the specified id.
    try{
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3304/votes/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`, // Attach JWT token for authentication
          'Content-Type': "application/json",
        },
        body: JSON.stringify({ userId: user.sub })
      });
      const data = await response.json();
      if(data.error){
        alert("Ocurrió un error votando, informa a los organizadores. \n" + data.error);
      }else{
        console.log(data.message);
        alert("Voto emitido con éxito.");
        // Refresh the data
        fetchMovies();
      }
    }catch(error){
      console.error("Error sending votes:", error);
      alert("Ocurrió un error votando, informa a los organizadores. \n" + error.message);
    }
  };

//============================================================================================
  //0Auth Loading message
  if (loading) {
    return <LoadingScreen/>;
  }
//============================================================================================
  //App rendering
  return (
    <div className="container">
      {!user ? (
        //If not authenticated not show page contents
        <div>
          <h2>Inicia sesión para poder votar.</h2>
          <button onClick={handleLogin}>Iniciar sesión con Google</button>
        </div>
      ) : (
        //If authenticated render all the page
        <div>
          <div className="banner">
            <img src={banner} alt="Banner" />
          </div>
          <div className="vote-grid">
            {movies.map((movie) => (
              // Automatically creates every movie frame
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
      )}

    </div>
  );
}

export default App;

