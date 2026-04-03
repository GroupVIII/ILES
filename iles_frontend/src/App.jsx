import { useState, setState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import './App.css';
import LoginPage from "./pages/LoginPage.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

//     return (   
//         <div className="App">
//             {isLoggedIn ? (
//                 <h1>Welcome to the Dashboard!</h1>
//             ) : (
//                 <LoginPage onLogin={() => setIsLoggedIn(true)} />
//             )}
//         </div>
//     );