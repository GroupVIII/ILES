import { useState } from 'react';

function Supervisordashboard() {
    const [comment, setComment] = useState('');
    const[placement, setPlacement] = useState(null);
    const[score, setScore]= useState({});
    const [loading, setLoading] = useState(true);

    return (
        <div>
            <h2>Supervisor Dashboard</h2>
        </div>
    );
}
export default Supervisordashboard();