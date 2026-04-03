import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import './App.css';
import LoginPage from "./pages/LoginPage.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (   
        <div className="App">
            {isLoggedIn ? (
                <Dashboard />
            ) : (
                <LoginPage onLogin={() => setIsLoggedIn(true)} />
            )}
        </div>
    );
}

export default App;