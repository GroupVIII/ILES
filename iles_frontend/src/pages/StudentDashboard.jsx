import { useState } from 'react';

function StudentDashboard() {

    const [form, setForm] = useState('');
    const[loading, setLoding] = useState(true);
    

    return (
        <div>
            <h2>Student Dashbord</h2>
        </div>
    );
}
export default StudentDashboard;