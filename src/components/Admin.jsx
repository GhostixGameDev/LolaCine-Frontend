import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import LoadingScreen from './Loading';
import banner from '../assets/images/banner.webp';
import googleIcon from "../assets/images/google.svg";
import logo from "../assets/images/logo.png";
//==============================================
  //Functions
function areCookiesEnabled() {
  document.cookie = "testcookie=1";
  const cookiesEnabled = document.cookie.indexOf("testcookie") !== -1;
  document.cookie = "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  return cookiesEnabled;
}

function panel(isAdmin){
    if(isAdmin != true){
        return(
            alert("No tienes permitido el acceso a esta página.")
        )
    }
}
//=============================
  //Component
function Admin() {
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const server = import.meta.env.VITE_BACKEND_URL;
  //=======================================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchMovies(currentUser);
        userIsAdmin(currentUser);
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
      const response = await fetch(`${server}/proposals`, {
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
  //Admin functions
  const changeVotingState = async (newState) => {
    try {
        console.log(newState);
        // Changes voting state according to newState value
        if(newState == true){
            const response = await fetch(`${server}/enable-votes`, {});
            if (!response.ok) {
                throw new Error('ERROR: Failed to fetch, response was not OK');
            }
            const data = await response;
            if(data.error){
                alert("Algo salió mal.");
            }else{
                alert("Votación habilitada.")
            }
        }else{
            const response = await fetch(`${server}/disable-votes`, {});
            if (!response.ok) {
                throw new Error('ERROR: Failed to fetch, response was not OK');
            }
            const data = await response;
            if(data.error){
                alert("Algo salió mal.");
            }else{
                alert("Votación deshabilitada.")
            }
        }
    }catch (error){
        console.error('Error fetching proposals:', error);
    }
  }

  const userIsAdmin = async (currentUser) => {
    try {
        // Changes voting state according to newState value
        const token = await currentUser.getIdToken();
        const response = await fetch(`${server}/user-is-admin`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            if (!response.ok) {
                throw new Error('ERROR: Failed to fetch, response was not OK');
            }
            const data = await response.json();
            console.log(data);
            console.log(data.isAdmin);
            setIsAdmin(data.isAdmin);
    }catch (error){
        console.error('Error fetching proposals:', error);
      }
  }
//============================================================================================
  // Google sign in
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try{
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      fetchMovies(result.user);
    }catch (error){
      console.error("Error signing in with Google", error);
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
        (!isAdmin) ? (
            <div className='no-access'>
                <span>No tienes acceso a esta página.</span>
                <a href='../index.html'>Volver.</a>
            </div>
        ) : (
            <div className='admin-panel'>
                <div className='panel-buttons'>
                    <button onClick={() => {changeVotingState(true)}}>Habilitar votación</button>
                    <button onClick={() => {changeVotingState(false)}}>Deshabilitar votación</button>
                </div>
                <div className='proposal-list'>
                    <table>
                        <tr className='column-names'>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Escuela</th>
                            <th>Grupo</th>
                            <th>Votos</th>
                        </tr>
                        {movies.map((movie) => {
                            return(
                                <tr key={movie.ID}>
                                    <th>{movie.ID}</th>
                                    <th>{movie.name}</th>
                                    <th>{movie.school}</th>
                                    <th>{movie.group}</th>
                                    <th>{movie.votes}</th>
                                </tr>
                            )})
                        }
                    </table>
                </div>
            </div>
        )
      )}

    </div>
  );
}


export default Admin;

