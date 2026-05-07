import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- PROFESSIONAL DATE FORMATTER ---
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'TBD';
  const parts = dateStr.split('-');
  if(parts.length !== 3) return dateStr;
  
  const [year, month, day] = parts;
  const d = parseInt(day, 10);
  const m = parseInt(month, 10) - 1; 
  const y = parseInt(year, 10);
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${getOrdinal(d)} ${months[m]} ${y}`;
};

// --- ID EXTRACTOR ---
// Safely handles both plain numbers (from dropdowns) and formatted strings (from backend)
const extractId = (val) => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    if (/^\d+$/.test(val)) return parseInt(val, 10);
    const match = val.match(/ID:\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
  }
  return null;
};

// --- SYSTEM-WIDE WORKLOAD TOOLTIP ---
const SystemWorkloadTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label} (Global)</div>
        {payload.map((entry, index) => {
          let textColor = '#fff';
          if (entry.name === 'Approved') textColor = '#10b981';
          else if (entry.name === 'Pending') textColor = '#3b82f6';
          else if (entry.name === 'Reviewed') textColor = '#fef3c7'; // 👈 Creamish-white for Reviewed
          else if (entry.name === 'In Revision') textColor = '#ef4444'; // 👈 Red for Revisions

          return (
            <div key={index} style={{ color: textColor, fontWeight: 'bold', margin: '4px 0' }}>
              {entry.name}: {entry.value} logs
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview'); 

  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [criteriaList, setCriteriaList] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- ADMIN ACTION STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlacementId, setEditingPlacementId] = useState(null);
  const [assignmentEdits, setAssignmentEdits] = useState({});
  const [adminMessage, setAdminMessage] = useState(null);

  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'STUDENT' });
  const [newPlacement, setNewPlacement] = useState({ company_name: '', student: '', workplace_supervisor: '', academic_supervisor: '', start_date: '', end_date: '' });

  // --- CRITERIA ENGINE STATES ---
  const [newCriteria, setNewCriteria] = useState({ name: '', description: '', weight: '' });
  const [editingCriteriaId, setEditingCriteriaId] = useState(null);
  const [criteriaEdits, setCriteriaEdits] = useState({});

  // --- UI STATES ---
  const [chartType, setChartType] = useState('bar');
  const [dashModal, setDashModal] = useState(null);

  // SCROLL LOCK EFFECT
  useEffect(() => {
    if (dashModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [dashModal]);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const [placeRes, logsRes, evalRes, critRes, usersRes] = await Promise.all([
        api.get('/api/placements/'),
        api.get('/api/logs/'),
        api.get('/api/evaluations/'),
        api.get('/api/evaluation-criteria/'),
        api.get('/api/users/') 
      ]);

      setPlacements(placeRes.data);
      setLogs(logsRes.data.filter(log => log.status !== 'DRAFT'));
      setEvaluations(evalRes.data);
      setCriteriaList(critRes.data);
      setUsers(usersRes.data);
    } catch (error) { 
      console.error("Failed to synchronise system data:", error); 
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSystemData();
  }, [activeTab]); 

  const students = users.filter(u => u.role === 'STUDENT');
  const academicSups = users.filter(u => u.role === 'ACADEMIC_SUPERVISOR');
  const workplaceSups = users.filter(u => u.role === 'WORKPLACE_SUPERVISOR');
  const pendingPlacements = placements.filter(p => !extractId(p.academic_supervisor) || !extractId(p.workplace_supervisor)).length;
  
  const currentTotalWeight = criteriaList.reduce((sum, c) => sum + parseFloat(c.weight), 0);

  // --- ACTION HANDLERS ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAdminMessage(null);
    try {
      const response = await api.post('/api/users/', newUser);
      setUsers([...users, response.data]);
      setNewUser({ username: '', email: '', password: '', role: 'STUDENT' });
      setAdminMessage({ type: 'success', text: `User ${response.data.username} created successfully.` });
    } catch (error) {
      setAdminMessage({ type: 'error', text: 'Failed to create user. Username/Email may already exist.' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete this user? All their associated logs and placements will be affected.")) return;
    try {
      await api.delete(`/api/users/${userId}/`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user.");
    }
  };

  const handleCreatePlacement = async (e) => {
    e.preventDefault();
    setAdminMessage(null);
    try {
      const payload = {
        company_name: newPlacement.company_name,
        student: parseInt(newPlacement.student),
        start_date: newPlacement.start_date,
        end_date: newPlacement.end_date,
        workplace_supervisor: newPlacement.workplace_supervisor ? parseInt(newPlacement.workplace_supervisor) : null,
        academic_supervisor: newPlacement.academic_supervisor ? parseInt(newPlacement.academic_supervisor) : null
      };

      const response = await api.post('/api/placements/', payload);
      setPlacements([...placements, response.data]);
      setNewPlacement({ company_name: '', student: '', workplace_supervisor: '', academic_supervisor: '', start_date: '', end_date: '' });
      setAdminMessage({ type: 'success', text: 'Internship Placement successfully deployed.' });
    } catch (error) {
      setAdminMessage({ type: 'error', text: 'Failed to create placement. Check required fields.' });
    }
  };

  const handleSaveAssignment = async (placementId) => {
    try {
      const currentEdits = assignmentEdits[placementId] || {};
      const placement = placements.find(p => p.id === placementId);
      
      const rawAc = currentEdits.academic_supervisor !== undefined ? currentEdits.academic_supervisor : placement?.academic_supervisor;
      const rawWp = currentEdits.workplace_supervisor !== undefined ? currentEdits.workplace_supervisor : placement?.workplace_supervisor;

      const ac_sup = extractId(rawAc);
      const wp_sup = extractId(rawWp);

      const payload = {
        academic_supervisor: ac_sup,
        workplace_supervisor: wp_sup,
        start_date: placement.start_date,
        end_date: placement.end_date      
      };

      const response = await api.patch(`/api/placements/${placementId}/`, payload);
      setPlacements(placements.map(p => p.id === placementId ? response.data : p));
      setEditingPlacementId(null);
    } catch (error) {
      console.error("Failed to update assignment", error);
      alert("Update failed. Check connection.");
    }
  };

  const handleCreateCriteria = async (e) => {
    e.preventDefault();
    setAdminMessage(null);
    const weight = parseFloat(newCriteria.weight);
    
    if (currentTotalWeight + weight > 100) {
      setAdminMessage({ type: 'error', text: `Cannot add criterion. Total weight would be ${currentTotalWeight + weight}%, exceeding the 100% strict limit.` });
      return;
    }

    try {
      const response = await api.post('/api/evaluation-criteria/', newCriteria);
      setCriteriaList([...criteriaList, response.data]);
      setNewCriteria({ name: '', description: '', weight: '' });
      setAdminMessage({ type: 'success', text: 'Evaluation criterion successfully integrated.' });
    } catch (error) {
      setAdminMessage({ type: 'error', text: 'Failed to create criterion. Verify connection.' });
    }
  };

  const handleSaveCriteriaEdit = async (id) => {
    setAdminMessage(null);
    const editData = criteriaEdits[id];
    const newWeight = parseFloat(editData.weight);
    const otherTotal = criteriaList.filter(c => c.id !== id).reduce((sum, c) => sum + parseFloat(c.weight), 0);
    
    if (otherTotal + newWeight > 100) {
      setAdminMessage({ type: 'error', text: `Cannot update criterion. Total weight would jump to ${otherTotal + newWeight}%, exceeding the 100% limit.` });
      return;
    }

    try {
      const response = await api.patch(`/api/evaluation-criteria/${id}/`, editData);
      setCriteriaList(criteriaList.map(c => c.id === id ? response.data : c));
      setEditingCriteriaId(null);
      setAdminMessage({ type: 'success', text: 'Criterion successfully updated.' });
    } catch (error) {
      setAdminMessage({ type: 'error', text: 'Failed to update criterion.' });
    }
  };

  const handleDeleteCriteria = async (id) => {
    if (!window.confirm("CRITICAL WARNING: Deleting a criterion will permanently affect all academic evaluations. Proceed?")) return;
    setAdminMessage(null);
    try {
      await api.delete(`/api/evaluation-criteria/${id}/`);
      setCriteriaList(criteriaList.filter(c => c.id !== id));
      setAdminMessage({ type: 'success', text: 'Criterion permanently deleted from the system.' });
    } catch (error) {
      setAdminMessage({ type: 'error', text: 'Failed to delete criterion.' });
    }
  };

  if (loading) return <div className="dark-dashboard p-8">Establishing system uplink...</div>;

  // 👈 FIX: Updated workload mapping to match the new states
  const systemWorkloadData = Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1;
    const weekLogs = logs.filter(l => parseInt(l.week_number) === weekNum);
    return {
      name: `Week ${weekNum}`,
      Approved: weekLogs.filter(l => l.status === 'APPROVED').length,
      Pending: weekLogs.filter(l => l.status === 'SUBMITTED').length,
      Reviewed: weekLogs.filter(l => l.status === 'REVIEWED').length,
      'In Revision': weekLogs.filter(l => l.status === 'REJECTED').length,
    };
  });

  const systemRadarData = criteriaList.map(crit => {
    const critEvals = evaluations.filter(e => e.criteria === crit.id);
    const averageScore = critEvals.length > 0 ? critEvals.reduce((sum, e) => sum + parseFloat(e.score), 0) / critEvals.length : 0;
    return { subject: crit.name, score: Math.round(averageScore), fullMark: 100 };
  });

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role.replace('_', ' ').toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toString().includes(searchQuery)
  );

  return (
    <div className="dark-dashboard" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ color: 'var(--primary-blue)', textShadow: '0 0 10px rgba(59,130,246,0.5)' }}>ILES</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span className="icon">🌐</span> Command Centre</button>
          <button className={`nav-item ${activeTab === 'placements' ? 'active' : ''}`} onClick={() => setActiveTab('placements')}>
            <span className="icon">📍</span> Placement Matrix
            {pendingPlacements > 0 && (<span style={{ marginLeft: 'auto', background: '#eab308', color: 'black', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{pendingPlacements}</span>)}
          </button>
          <button className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`} onClick={() => setActiveTab('directory')}><span className="icon">👥</span> Master Directory</button>
          <button className={`nav-item ${activeTab === 'criteria' ? 'active' : ''}`} onClick={() => { setActiveTab('criteria'); setAdminMessage(null); }}><span className="icon">⚖️</span> Evaluation Criteria</button>
          <button className={`nav-item ${activeTab === 'network' ? 'active' : ''}`} onClick={() => { setActiveTab('network'); setAdminMessage(null); }}><span className="icon">⚙️</span> Network Admin</button>
        </nav>
      </aside>

      <main className="main-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header className="top-header">
          <div className="user-profile">
            <span className="welcome-text">System Administrator: {user?.username}</span>
            <div className="avatar" style={{background: '#ef4444'}}>🛡️</div>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <div className="content-scroll" style={{ flex: 1, padding: '1.5rem', overflowY: dashModal ? 'hidden' : 'auto' }}>
          
          {/* TAB 1: COMMAND CENTRE */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h1 className="page-title" style={{ marginBottom: '1rem', flexShrink: 0 }}>System Command Centre</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem', flexShrink: 0 }}>
                <div className="glass-card glow-blue" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('directory')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Master Directory</h4></div>
                  <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-blue)', marginTop: '0.5rem' }}>{users.length}</div>
                </div>
                
                <div className="glass-card glow-green" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('placements')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Active Placements</h4></div>
                  <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--success-green)', marginTop: '0.5rem' }}>{placements.length}</div>
                </div>

                <div className={`glass-card ${pendingPlacements > 0 ? 'glow-yellow' : 'glow-blue'}`} style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('placements')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Pending Assignments</h4></div>
                  <div style={{ fontSize: '3rem', fontWeight: '900', color: pendingPlacements > 0 ? 'var(--warning-yellow)' : 'var(--primary-blue)', marginTop: '0.5rem' }}>{pendingPlacements}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                <section className="section-block" style={{ display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="section-title">System-Wide Log Compliance</h2>
                  </div>
                  <div 
                    className="glass-card glow-blue" 
                    style={{ flex: 1, padding: '1rem 2rem 1rem 0', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onClick={() => setChartType(prev => prev === 'bar' ? 'line' : 'bar')}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'bar' ? (
                        <BarChart data={systemWorkloadData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                          <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<SystemWorkloadTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          <Bar dataKey="Approved" stackId="a" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))' }} />
                          <Bar dataKey="Pending" stackId="a" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.8))' }} />
                          {/* 👈 FIX: Added Reviewed to the BarChart */}
                          <Bar dataKey="Reviewed" stackId="a" fill="rgba(254, 243, 199, 0.2)" stroke="#fef3c7" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(254, 243, 199, 0.8))' }} />
                          {/* 👈 FIX: Renamed Rejected to In Revision */}
                          <Bar dataKey="In Revision" stackId="a" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))' }} />
                        </BarChart>
                      ) : (
                        <LineChart data={systemWorkloadData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                          <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<SystemWorkloadTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          <Line type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }}/>
                          <Line type="monotone" dataKey="Pending" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))' }}/>
                          {/* 👈 FIX: Added Reviewed to the LineChart */}
                          <Line type="monotone" dataKey="Reviewed" stroke="#fef3c7" strokeWidth={3} dot={{ r: 4, fill: '#fef3c7', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(254, 243, 199, 0.6))' }}/>
                          {/* 👈 FIX: Renamed Rejected to In Revision */}
                          <Line type="monotone" dataKey="In Revision" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))' }}/>
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="section-block" style={{ display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                  <h2 className="section-title">Average Cohort Performance</h2>
                  <div 
                    className="glass-card glow-purple" 
                    onClick={() => setDashModal('RADAR')}
                    style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart margin={{ top: 25, right: 35, bottom: 25, left: 35 }} outerRadius="65%" data={systemRadarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.15)" />
                        
                        {/* TEXT CLIPPING FIX: width forces the text to wrap on multiple lines instead of cutting off */}
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold', width: 90 }} tickLine={false} />
                        
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="System Average" dataKey="score" stroke="#a78bfa" strokeWidth={2} fill="rgba(139, 92, 246, 0.4)" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.5)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* TAB 2: PLACEMENT MATRIX */}
          {activeTab === 'placements' && (
             <>
               <h1 className="page-title">Global Placement Matrix</h1>
               <section className="section-block">
                 <h2 className="section-title">All Programme Placements</h2>
                 {placements.length === 0 ? (
                   <div className="glass-card"><p className="text-muted">No active placements in the system.</p></div>
                 ) : (
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                     {placements.map((placement, index) => {
                       const isFullyAssigned = extractId(placement.academic_supervisor) && extractId(placement.workplace_supervisor);
                       const isEditing = editingPlacementId === placement.id;
                       
                       return (
                         <div 
                           key={placement.id} 
                           className={`glass-card ${isFullyAssigned ? 'glow-blue' : 'glow-yellow'}`}
                           style={{ 
                             display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
                             padding: '1.25rem 2rem', width: '100%', boxSizing: 'border-box',
                             animation: `slideUpFade 0.4s ease-out ${index * 0.1}s both`
                           }}
                         >
                           <div style={{ flex: '1' }}>
                             <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>
                               🎓 {placement.student_name || `Student ID: ${placement.student}`}
                             </h3>
                             <div style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px' }}>
                               🏢 {placement.company_name}
                             </div>
                             <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                               🗓️ {formatDisplayDate(placement.start_date)} - {formatDisplayDate(placement.end_date)}
                             </p>
                           </div>

                           <div style={{ flex: '1.5', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem', display: 'flex', gap: '1rem' }}>
                             {isEditing ? (
                               <>
                                 <div style={{ flex: 1 }}>
                                   <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Academic Overseer</label>
                                   <select 
                                     className="dark-input" style={{ padding: '6px', fontSize: '0.85rem' }}
                                     value={extractId(assignmentEdits[placement.id]?.academic_supervisor) || extractId(placement.academic_supervisor) || ''}
                                     onChange={(e) => setAssignmentEdits({...assignmentEdits, [placement.id]: { ...assignmentEdits[placement.id], academic_supervisor: e.target.value }})}
                                   >
                                     <option value="">-- Unassigned --</option>
                                     {academicSups.map(s => <option key={s.id} value={s.id}>{s.username} (ID: {s.id})</option>)}
                                   </select>
                                 </div>
                                 <div style={{ flex: 1 }}>
                                   <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Workplace Guide</label>
                                   <select 
                                     className="dark-input" style={{ padding: '6px', fontSize: '0.85rem' }}
                                     value={extractId(assignmentEdits[placement.id]?.workplace_supervisor) || extractId(placement.workplace_supervisor) || ''}
                                     onChange={(e) => setAssignmentEdits({...assignmentEdits, [placement.id]: { ...assignmentEdits[placement.id], workplace_supervisor: e.target.value }})}
                                   >
                                     <option value="">-- Unassigned --</option>
                                     {workplaceSups.map(s => <option key={s.id} value={s.id}>{s.username} (ID: {s.id})</option>)}
                                   </select>
                                 </div>
                               </>
                             ) : (
                               <>
                                 <div style={{ flex: 1 }}>
                                   <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>Academic Overseer</span>
                                   <span style={{ color: placement.academic_supervisor ? '#a78bfa' : '#fca5a5', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                     {placement.academic_supervisor ? String(placement.academic_supervisor) : '⚠️ Unassigned'}
                                   </span>
                                 </div>
                                 <div style={{ flex: 1 }}>
                                   <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>Workplace Guide</span>
                                   <span style={{ color: placement.workplace_supervisor ? 'var(--success-green)' : '#fca5a5', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                     {placement.workplace_supervisor ? String(placement.workplace_supervisor) : '⚠️ Unassigned'}
                                   </span>
                                 </div>
                               </>
                             )}
                           </div>

                           <div style={{ flex: '0.5', textAlign: 'right' }}>
                             {!isFullyAssigned && !isEditing && (
                               <div className="status-badge bg-yellow" style={{ display: 'inline-block', marginBottom: '8px' }}>
                                 ACTION REQUIRED
                               </div>
                             )}
                             
                             {isEditing ? (
                               <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                 <button onClick={() => setEditingPlacementId(null)} style={{ background: 'transparent', color: '#fca5a5', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                                 <button onClick={() => handleSaveAssignment(placement.id)} style={{ background: 'var(--success-green)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Save</button>
                               </div>
                             ) : (
                               <button 
                                 onClick={() => {
                                   setEditingPlacementId(placement.id);
                                   setAssignmentEdits({ ...assignmentEdits, [placement.id]: { academic_supervisor: placement.academic_supervisor, workplace_supervisor: placement.workplace_supervisor }});
                                 }}
                                 style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', width: '100%', transition: 'background 0.2s' }}
                               >
                                 Manage Assignment
                               </button>
                             )}
                           </div>

                         </div>
                       );
                     })}
                   </div>
                 )}
               </section>
             </>
          )}

          {/* TAB 3: MASTER DIRECTORY */}
          {activeTab === 'directory' && (
             <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                 <h1 className="page-title" style={{ margin: 0 }}>Master User Directory</h1>
                 <input 
                   type="text" 
                   className="dark-input" 
                   placeholder="🔍 Search by username or role..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   style={{ width: '350px', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
                 />
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                 
                 <div className="glass-card glow-blue" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
                    <h4 style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>System Role Distribution</h4>
                    <div style={{ flex: 1, width: '100%', minHeight: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Students', value: students.length, color: '#60a5fa' },
                              { name: 'Workplace Sups', value: workplaceSups.length, color: '#fde047' },
                              { name: 'Academic Sups', value: academicSups.length, color: '#c084fc' }
                            ]}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                          >
                            {[
                              { name: 'Students', value: students.length, color: '#60a5fa' },
                              { name: 'Workplace Sups', value: workplaceSups.length, color: '#fde047' },
                              { name: 'Academic Sups', value: academicSups.length, color: '#c084fc' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa' }}><span>Students:</span> <span>{students.length}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fde047' }}><span>Workplace:</span> <span>{workplaceSups.length}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c084fc' }}><span>Academic:</span> <span>{academicSups.length}</span></div>
                    </div>
                 </div>

                 <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                   <div style={{ flex: 1, overflowY: 'auto' }}>
                     <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem', tableLayout: 'fixed' }}>
                       <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 5 }}>
                         <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                           <th style={{ padding: '1rem', width: '15%' }}>ID</th>
                           <th style={{ padding: '1rem', width: '35%' }}>Username</th>
                           <th style={{ padding: '1rem', width: '25%' }}>Role Designation</th>
                           <th style={{ padding: '1rem', width: '25%', textAlign: 'right' }}>Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                         {filteredUsers.length === 0 ? (
                           <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found matching "{searchQuery}"</td></tr>
                         ) : (
                           filteredUsers.map((u, index) => {
                             let roleColor = 'var(--text-muted)'; let roleBg = 'transparent';
                             if (u.role === 'STUDENT') { roleColor = '#60a5fa'; roleBg = 'rgba(59, 130, 246, 0.1)'; }
                             if (u.role === 'WORKPLACE_SUPERVISOR') { roleColor = '#fde047'; roleBg = 'rgba(250, 204, 21, 0.1)'; }
                             if (u.role === 'ACADEMIC_SUPERVISOR') { roleColor = '#c084fc'; roleBg = 'rgba(168, 85, 247, 0.1)'; }
                             if (u.role === 'ADMIN') { roleColor = '#f87171'; roleBg = 'rgba(239, 68, 68, 0.1)'; }

                             return (
                               <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', animation: `slideUpFade 0.3s ease-out ${index * 0.05}s both` }}>
                                 <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>#{u.id}</td>
                                 <td style={{ padding: '1rem', color: 'white', fontWeight: 'bold', wordBreak: 'break-all' }}>{u.username}</td>
                                 <td style={{ padding: '1rem' }}>
                                   {/* ROLE BOX FIX: Inline-block prevents jagged highlight blocks on line-wrap */}
                                   <div style={{ display: 'inline-block', color: roleColor, background: roleBg, padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.5px', textAlign: 'center', lineHeight: '1.4' }}>
                                     {u.role.replace('_', ' ')}
                                   </div>
                                 </td>
                                 <td style={{ padding: '1rem', textAlign: 'right' }}>
                                   <button 
                                     onClick={() => handleDeleteUser(u.id)}
                                     style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                   >
                                     🗑️ Delete
                                   </button>
                                 </td>
                               </tr>
                             );
                           })
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
             </div>
          )}

          {/* TAB 4: EVALUATION CRITERIA ENGINE */}
          {activeTab === 'criteria' && (
             <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
               <h1 className="page-title" style={{ marginBottom: '1.5rem', flexShrink: 0 }}>Evaluation Criteria Admin</h1>
               
               {adminMessage && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: adminMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: adminMessage.type === 'error' ? '#fca5a5' : '#6ee7b7', borderLeft: `4px solid ${adminMessage.type === 'error' ? '#ef4444' : '#10b981'}` }}>
                    {adminMessage.text}
                  </div>
               )}
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                 
                 <div className="glass-card glow-purple" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                   <h3 style={{ margin: '0 0 1.5rem 0', color: 'white', fontSize: '1.25rem' }}>Create New Criterion</h3>
                   <form onSubmit={handleCreateCriteria}>
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <label>Criterion Name</label>
                       <input type="text" className="dark-input" placeholder="e.g., Code Quality" required value={newCriteria.name} onChange={(e) => setNewCriteria({...newCriteria, name: e.target.value})} />
                     </div>
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <label>Description</label>
                       <textarea className="dark-input textarea" placeholder="Define the grading standard..." required value={newCriteria.description} onChange={(e) => setNewCriteria({...newCriteria, description: e.target.value})} style={{ minHeight: '80px' }}></textarea>
                     </div>
                     <div className="input-group" style={{ marginBottom: '2rem' }}>
                       <label>Assigned Weight (%)</label>
                       <input type="number" className="dark-input" placeholder="e.g., 15" required min="1" max="100" value={newCriteria.weight} onChange={(e) => setNewCriteria({...newCriteria, weight: e.target.value})} />
                     </div>
                     <button type="submit" style={{ width: '100%', background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                       + Deploy to Syllabus
                     </button>
                   </form>
                   
                   <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: currentTotalWeight > 100 ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Current Global Weight</span>
                        <span style={{ fontWeight: '900', fontSize: '1.1rem', color: currentTotalWeight === 100 ? 'var(--success-green)' : (currentTotalWeight > 100 ? 'var(--error-red)' : 'var(--warning-yellow)') }}>
                           {currentTotalWeight}% <span style={{fontSize: '0.85rem', opacity: 0.5}}>/ 100%</span>
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                         <div style={{ height: '100%', width: `${Math.min(currentTotalWeight, 100)}%`, background: currentTotalWeight === 100 ? 'var(--success-green)' : (currentTotalWeight > 100 ? 'var(--error-red)' : 'var(--warning-yellow)'), transition: 'width 0.3s ease' }}></div>
                      </div>
                      {currentTotalWeight < 100 && <div style={{ fontSize: '0.75rem', color: 'var(--warning-yellow)', marginTop: '8px', textAlign: 'right' }}>{100 - currentTotalWeight}% unallocated.</div>}
                      {currentTotalWeight > 100 && <div style={{ fontSize: '0.75rem', color: 'var(--error-red)', marginTop: '8px', textAlign: 'right' }}>CRITICAL: Over limit by {currentTotalWeight - 100}%. Editing required.</div>}
                   </div>
                 </div>

                 <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                   <div className="card-header" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Active Syllabus Standards</h3>
                   </div>
                   <div style={{ flex: 1, overflowY: 'auto' }}>
                     <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                       <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 5 }}>
                         <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                           <th style={{ padding: '1rem' }}>Criteria Name & Rule</th>
                           <th style={{ padding: '1rem', width: '20%', textAlign: 'center' }}>Weight</th>
                           <th style={{ padding: '1rem', width: '25%', textAlign: 'right' }}>Management</th>
                         </tr>
                       </thead>
                       <tbody>
                         {criteriaList.length === 0 ? (
                           <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No evaluation criteria established yet.</td></tr>
                         ) : (
                           criteriaList.map((crit, index) => {
                             const isEditing = editingCriteriaId === crit.id;
                             return (
                               <tr key={crit.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', animation: `slideUpFade 0.3s ease-out ${index * 0.05}s both` }}>
                                 {isEditing ? (
                                   <>
                                     <td style={{ padding: '1rem' }}>
                                        <input type="text" className="dark-input" value={criteriaEdits[crit.id]?.name || ''} onChange={(e) => setCriteriaEdits({...criteriaEdits, [crit.id]: {...criteriaEdits[crit.id], name: e.target.value}})} style={{ width: '100%', padding: '6px', marginBottom: '6px' }} />
                                        <textarea className="dark-input textarea" value={criteriaEdits[crit.id]?.description || ''} onChange={(e) => setCriteriaEdits({...criteriaEdits, [crit.id]: {...criteriaEdits[crit.id], description: e.target.value}})} style={{ width: '100%', padding: '6px', minHeight: '50px' }}></textarea>
                                     </td>
                                     <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <input type="number" className="dark-input" value={criteriaEdits[crit.id]?.weight || ''} onChange={(e) => setCriteriaEdits({...criteriaEdits, [crit.id]: {...criteriaEdits[crit.id], weight: e.target.value}})} style={{ width: '70px', padding: '6px', textAlign: 'center' }} />
                                        <span style={{color: 'var(--text-muted)', marginLeft: '4px'}}>%</span>
                                     </td>
                                     <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                          <button onClick={() => setEditingCriteriaId(null)} style={{ background: 'transparent', color: '#fca5a5', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                                          <button onClick={() => handleSaveCriteriaEdit(crit.id)} style={{ background: 'var(--success-green)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Save</button>
                                        </div>
                                     </td>
                                   </>
                                 ) : (
                                   <>
                                     <td style={{ padding: '1rem' }}>
                                       <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>{crit.name}</div>
                                       <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>{crit.description}</div>
                                     </td>
                                     <td style={{ padding: '1rem', color: 'var(--warning-yellow)', fontWeight: '900', textAlign: 'center', fontSize: '1.1rem' }}>
                                       {parseFloat(crit.weight)}%
                                     </td>
                                     <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                          <button onClick={() => { setEditingCriteriaId(crit.id); setCriteriaEdits({...criteriaEdits, [crit.id]: { name: crit.name, description: crit.description, weight: crit.weight }}); }} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Edit</button>
                                          <button onClick={() => handleDeleteCriteria(crit.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Delete</button>
                                        </div>
                                     </td>
                                   </>
                                 )}
                               </tr>
                             );
                           })
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
             </div>
          )}

          {/* TAB 5: NETWORK ADMINISTRATION FORMS */}
          {activeTab === 'network' && (
             <>
               <h1 className="page-title">Network Administration</h1>
               
               {adminMessage && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: adminMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: adminMessage.type === 'error' ? '#fca5a5' : '#6ee7b7', borderLeft: `4px solid ${adminMessage.type === 'error' ? '#ef4444' : '#10b981'}` }}>
                    {adminMessage.text}
                  </div>
               )}

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                 
                 {/* FORM 1: Register New User */}
                 <div className="glass-card glow-blue" style={{ padding: '2rem' }}>
                   <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Register New User</h3>
                   <form onSubmit={handleCreateUser}>
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <label>Username</label>
                       <input type="text" className="dark-input" required value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
                     </div>
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <label>Email Address</label>
                       <input type="email" className="dark-input" placeholder="user@university.edu" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                     </div>
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <label>Temporary Password</label>
                       <input type="password" className="dark-input" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                     </div>
                     <div className="input-group" style={{ marginBottom: '2rem' }}>
                       <label>Assign Role</label>
                       <select className="dark-input" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                         <option value="STUDENT">Student Intern</option>
                         <option value="WORKPLACE_SUPERVISOR">Workplace Supervisor</option>
                         <option value="ACADEMIC_SUPERVISOR">Academic Supervisor</option>
                         <option value="ADMIN">Internship Administrator</option>
                       </select>
                     </div>
                     <button type="submit" style={{ width: '100%', background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                       + Create User Profile
                     </button>
                   </form>
                 </div>

                 {/* FORM 2: Assign Internship Placement */}
                 <div className="glass-card glow-green" style={{ padding: '2rem' }}>
                   <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Assign Internship Placement</h3>
                   <form onSubmit={handleCreatePlacement}>
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <label>Company Name</label>
                       <input type="text" className="dark-input" placeholder="e.g., CrateCo" required value={newPlacement.company_name} onChange={(e) => setNewPlacement({...newPlacement, company_name: e.target.value})} />
                     </div>
                     <div className="input-group" style={{ marginBottom: '1rem' }}>
                       <label>Select Student</label>
                       <select className="dark-input" required value={newPlacement.student} onChange={(e) => setNewPlacement({...newPlacement, student: e.target.value})}>
                         <option value="" disabled>-- Assign a Student --</option>
                         {students.map(s => <option key={s.id} value={s.id}>{s.username} (ID: {s.id})</option>)}
                       </select>
                     </div>
                     
                     <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                       <div className="input-group" style={{ flex: 1 }}>
                         <label>Workplace Supervisor</label>
                         <select className="dark-input" value={newPlacement.workplace_supervisor} onChange={(e) => setNewPlacement({...newPlacement, workplace_supervisor: e.target.value})}>
                           <option value="">-- Select --</option>
                           {workplaceSups.map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
                         </select>
                       </div>
                       <div className="input-group" style={{ flex: 1 }}>
                         <label>Academic Supervisor</label>
                         <select className="dark-input" value={newPlacement.academic_supervisor} onChange={(e) => setNewPlacement({...newPlacement, academic_supervisor: e.target.value})}>
                           <option value="">-- Select --</option>
                           {academicSups.map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
                         </select>
                       </div>
                     </div>

                     <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                       <div className="input-group" style={{ flex: 1 }}>
                         <label>Start Date</label>
                         <input type="date" className="dark-input" required value={newPlacement.start_date} onChange={(e) => setNewPlacement({...newPlacement, start_date: e.target.value})} />
                       </div>
                       <div className="input-group" style={{ flex: 1 }}>
                         <label>End Date</label>
                         <input type="date" className="dark-input" required value={newPlacement.end_date} onChange={(e) => setNewPlacement({...newPlacement, end_date: e.target.value})} />
                       </div>
                     </div>

                     <button type="submit" style={{ width: '100%', background: 'var(--success-green)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                       + Finalize Placement
                     </button>
                   </form>
                 </div>

               </div>
             </>
          )}

        </div>
      </main>

      {/* DASHBOARD CARD DETAIL MODAL (FULL BLUR) */}
      {dashModal === 'RADAR' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', boxSizing: 'border-box' }}>
            <div className="glass-card glow-purple" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '2.5rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out' }}>
                <button onClick={() => setDashModal(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>✕</button>
                <h2 style={{ color: 'white', marginBottom: '1.5rem', marginTop: 0, textAlign: 'center' }}>System Cohort Competency Breakdown</h2>
                
                <div style={{ height: '400px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }} outerRadius="75%" data={systemRadarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.2)" />
                      {/* TEXT CLIPPING FIX: width 90 forces the text to wrap instead of cutting off in the modal */}
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 14, fontWeight: 'bold', width: 90 }} tickLine={false} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="score" stroke="#a78bfa" strokeWidth={3} fill="#a78bfa" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid #a78bfa', borderRadius: '8px', color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button onClick={() => setDashModal(null)} className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close Details</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;