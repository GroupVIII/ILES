import { useState } from "react";

function LoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


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

function handleSubmit(e){
    e.preventDefault();
    // Perform login logic here, such as sending a request to the server
    console.log("Email:", email);
    // console.log("Password:", password);
    // // Reset form fields
    // setEmail('');
    // setPassword('');
}