import { useState } from "react";
import Issue from "../components/Issue.jsx";




function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="intro">
      <h1>Welcome to the Dashboard!</h1>
    </div>
    
  );
}

export default Dashboard;

