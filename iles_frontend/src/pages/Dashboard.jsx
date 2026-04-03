import { useState } from "react";
// import Issue from "../components/Issue.jsx";




function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(true);
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    

  return (
    <div className="intro">
      <h1>Welcome to the Dashboard!</h1>
    </div>
    
  );
}

export default Dashboard;

