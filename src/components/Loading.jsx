import logo from "../assets/images/logo.png" 

function LoadingScreen() {
  //App rendering
  return (
    <div className="container">
      <div className="loading-box">
        <img src={logo} alt="Logo"></img>
        <div className="loader"></div>
      </div>
    </div>
  );
}

export default LoadingScreen;

