import { useState, useEffect, use } from 'react';

function StudentDashboard() {

    const [form, setForm] = useState('');
    const[loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (loading) {
            console.log("Loading student data..."); 
        } else {
            console.log("Student data loaded.");
        }
    }, [loading]);

    useEffect(() => {
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