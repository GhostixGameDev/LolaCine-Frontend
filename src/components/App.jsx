import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import LoadingScreen from './Loading';
import banner from '../assets/images/banner.webp';
import googleIcon from "../assets/images/google.svg";
import logo from "../assets/images/logo.png";

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
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchMovies(currentUser);
        checkUserVoteStatus(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

//============================================================================================
  //Proposals refreshing
  const fetchMovies = async (currentUser) => {
    try {
      // Fetches all the proposals from the server
      const token = await currentUser.getIdToken();
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


  const checkUserVoteStatus = async (currentUser) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:3304/user-vote-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user vote status');
      }
      const data = await response.json();
      if(currentUser.uid != import.meta.env.VITE_VOTE_MASTER){
        setHasVoted(data.hasVoted);
      }
    } catch (error) {
      console.error('Error checking user vote status:', error);
    }
  };
//============================================================================================
  // Google sign in
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try{
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      fetchMovies(result.user);
      checkUserVoteStatus(result.user);
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
    checkUserVoteStatus(user);
    if(!areCookiesEnabled()){ 
      // Display error message if cookies not enabled.
      alert("Debes tener las cookies habilitadas para votar.")
      return;}
    if (hasVoted) {
      alert("Ya has votado. No puedes votar más de una vez.");
      return;
    }
    // Adds one vote for the specified id.
    try{
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3304/votes/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': "application/json",
        },
        body: JSON.stringify({ userId: user.uid })
      });
      const data = await response.json();
      if(data.error){
        alert("Ocurrió un error votando, informa a los organizadores. \n" + data.error);
      }else{
        console.log(data.message);
        alert("Voto emitido con éxito.");
        // Refresh the data
        fetchMovies(user);
        setHasVoted(true);

      }
    }catch(error){
      console.error("Error sending votes:", error);
      alert("Ocurrió un error votando, informa a los organizadores. \n" + error.message);
    }
  };

//============================================================================================
  //Auth Loading message
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
          <div className='login-form'>
            <div className='logo-container'><img src={logo} alt='Lola Cine Logo'></img></div>
            <h1>Inicia Sesión</h1>
            <button className='signin' onClick={handleLogin}>
              <div className='logo-container'><img src={googleIcon} alt='Google icon'></img></div>
              <span className='login-button-text'>Iniciar sesión con Google</span>
            </button>
          </div>
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
                <button onClick={() => handleVote(movie.ID)} disabled={hasVoted}>
                  {hasVoted ? "Ya votaste" : "Votar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;

