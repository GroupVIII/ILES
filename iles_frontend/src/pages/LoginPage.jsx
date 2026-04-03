import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axios from 'axios';

function LoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        // Perform login logic here, such as sending a request to the server
        console.log("Email:", email);
        console.log("Password:", password);
        // Reset form fields
        setEmail('');   
        setPassword('');
        // Navigate to the dashboard after successful login
        navigate('/dashboard');
    
    };
    const handleLogIn = () => {
        try {
            // Send login request to the server
            const response = axios.post('/api/login', { email, password }); 

        } catch (error) {
            alert("Login failed. Please check your credentials and try again.");
            console.error("Login failed:", error);

        }
    };

    return(
        <form onSubmit={handleSubmit}>
            <input
             type="email"
             value={email}
             onChange={(e)=>setEmail(e.target.value)}
             placeholder="Email"

             

            />

            <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Enter Password"

            />

             <button type="submit" diabled={!email || !password}>
                Login
             </button>

         </form>
    );
}
export default LoginPage;


