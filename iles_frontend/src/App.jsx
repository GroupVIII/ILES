import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import './App.css';
import LogInPage from "./pages/LoginPage.jsx";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogIn = (user) => {
    setCurrentUser(user); // user = { email, role }
  };

  const handleLogOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
  };
  return(
    <div>
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogOut} />
      ):(
        <LogInPage onLogin={handleLogIn} />
      )}
    </div>
  );
}
export default App;