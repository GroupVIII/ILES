import { useState } from "react";
// import Issue from "../components/Issue.jsx";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import SupervisorDashboard from "./SupervisorDashboard";


const Dashboard =({currentuser, setAuthData})=>{
  const handleLogOut= ()=> setAuthData(null);

  switch(user.role){
    case 'STUDENT':
      return <StudentDashboard user={currentuser} onLogOut = {handleLogOut} />

    case 'ADMIN':
      return <AdminDashboard user = {currentuser} onLogOut = {handleLogOut} />

    case 'SUPERVISOR':
      return <SupervisorDashboard user = {currentuser} onLogOut = {handleLogOut} />

    default:
      return <div style = {{color: 'red', padding: '2rem'}}>Error: Invalid Role</div>

  }
};
export default Dashboard;