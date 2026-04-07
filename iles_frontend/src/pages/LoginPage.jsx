import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './LogInPage.css';
import axios from 'axios';

function LogInPage(){
    // const [credentials, setCredentials] = useState({email:'', password:''});
    // const handleChange = (e)=>{setCredentials({...credentials, [e.target.name]: e.target.value})};
    // const handleSubmit = (e)=>{
    //     e.preventDefault();
    //     if(credentials.email && credentials.password){
    //         onLogin(credentials.email);
    //     }
    // };
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const navigate = useNavigate();
    // const handleSubmit = async(e) => {
    //     e.preventDefault();
    //     try{
    //         const response = await axios.post('/api/login', { email, password });
    //         console.log("Login Successful:", response.data);
    //         navigate('/dashboard');
    //     }
    //     catch(error){
    //         alert("Login failed. Please check your credentials and try again.");
    //         console.error("Login failed:", error);

    //     }
        
    // };

    const handleSubmit = (e)=>{setEmail(e.target.value)}
    return(
        <div className="login-container">
            <div className="card">  
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            placeholder="Email" 
                            
                        />
                    </div>

                    <div className="group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            placeholder="Enter Password"

                        />
                    </div>
                   

                    <button type="submit" disabled={!email || !password} className="submit-button">
                        LogIn
                    </button>

                </form>
            </div>
        </div>
    );
}
export default LogInPage;


