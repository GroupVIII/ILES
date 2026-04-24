import { useState } from 'react';

function StudentDashboard() {

    const [form, setForm] = useState('');
    const[loading, setLoading] = useState(true);
    

    return (
        <div>
            <h2>Student Dashboard</h2>
            <p>Welcome to your dashboard!</p>
            <span>Here you can view your progress, submit reports, and communicate with your supervisor.</span>
            <form>
                <label htmlFor="report">Submit your report:</label>
                <textarea id="report" value={form} onChange={(e) => setForm(e.target.value)} placeholder="Write your report here..."></textarea>
                <button type="submit">Submit</button>
            </form>
            <button onClick={() => setLoading(!loading)}>Toggle Loading</button>
        </div>
    );
}
export default StudentDashboard;