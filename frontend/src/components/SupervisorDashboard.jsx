import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
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

// --- CUSTOM TOOLTIP FOR THE SPARKLINE ---
const CustomSparklineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let statusColor = '#fff';
    let displayStatus = data.status;
    
    if (data.status === 'APPROVED') statusColor = '#10b981'; 
    else if (data.status === 'REJECTED') { statusColor = '#ef4444'; displayStatus = 'DRAFT (REVISION)'; } 
    else if (data.status === 'REVIEWED') { statusColor = '#fef3c7'; displayStatus = 'REVIEWED'; }
    else if (data.status === 'SUBMITTED') statusColor = '#eab308';
    else if (data.status === 'DRAFT') statusColor = '#fff';

    return (
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px',
        padding: '8px 12px', color: '#ffffff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          {data.name}
        </div>
        <div style={{ marginBottom: '4px' }}>{data.volume} words written</div>
        <div>Status: <span style={{ color: statusColor, fontWeight: '900', letterSpacing: '0.5px' }}>{displayStatus}</span></div>
      </div>
    );
  }
  return null;
};

// --- CUSTOM TOOLTIP FOR THE OVERVIEW WORKLOAD CHART ---
const WorkloadTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label}</div>
        {payload.map((entry, index) => {
          let textColor = '#fff';
          if (entry.name === 'Approved') textColor = '#10b981';
          else if (entry.name === 'Pending') textColor = '#eab308';
          else if (entry.name === 'Reviewed') textColor = '#fef3c7';
          else if (entry.name === 'Rejected') textColor = '#ef4444';

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

const SupervisorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview'); 

  const [logs, setLogs] = useState([]);
  const [placements, setPlacements] = useState([]); 
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  
  const [logSearchQuery, setLogSearchQuery] = useState('');
  
  // --- MODAL STATES ---
  const [reviewingLog, setReviewingLog] = useState(null); 
  const [viewingLog, setViewingLog] = useState(null); 
  const [viewingIntern, setViewingIntern] = useState(null);
  
  const [chartType, setChartType] = useState('bar');

  // --- DOUBLE SCROLL LOCK ---
  useEffect(() => {
    if (reviewingLog || viewingLog || viewingIntern) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [reviewingLog, viewingLog, viewingIntern]);

  useEffect(() => {
    const fetchSupervisorData = async () => {
      setLoading(true);
      try {
        const logsRes = await api.get('/api/logs/');
        const nonDraftLogs = logsRes.data.filter(log => log.status !== 'DRAFT');
        setLogs(nonDraftLogs);
      } catch (error) { console.error("Failed to fetch logs:", error); }

      try {
        const placementsRes = await api.get('/api/placements/');
        setPlacements(placementsRes.data);
      } catch (error) { console.error("Failed to fetch placements:", error); }

      setLoading(false);
    };
    fetchSupervisorData();
  }, [activeTab]); 

  const handleFeedbackChange = (logId, text) => {
    setFeedback({ ...feedback, [logId]: text });
  };

  const handleReviewTransition = async (logId, newStatus) => {
    setActionMessage(null);
    try {
      const response = await api.patch(`/api/logs/${logId}/`, {
        status: newStatus,
        supervisor_comment: feedback[logId] || ''
      });

      setLogs(logs.map(log => log.id === logId ? response.data : log));
      setReviewingLog(null);
      
      let successMsg = "Log updated.";
      if (newStatus === 'APPROVED') successMsg = "Log successfully approved and locked.";
      if (newStatus === 'REJECTED') successMsg = "Log returned to student for revision.";
      if (newStatus === 'REVIEWED') successMsg = "Log marked as reviewed (pending final approval).";
      
      setActionMessage({ type: 'success', text: successMsg });
    } catch (error) {
      console.error("Review failed:", error);
      setActionMessage({ type: 'error', text: 'Failed to submit review. Check your connection.' });
    }
  };

  if (loading) return <div className="dark-dashboard p-8">Loading action centre...</div>;

  const sortedLogs = [...logs].sort((a, b) => parseInt(a.week_number) - parseInt(b.week_number));
  
  // Update pending logs to include REVIEWED state as well
  const pendingLogs = sortedLogs.filter(log => log.status === 'SUBMITTED' || log.status === 'REVIEWED');
  const reviewedLogs = sortedLogs.filter(log => log.status === 'APPROVED');

  const applySearchFilter = (logsArray) => logsArray.filter(log => {
    if (!logSearchQuery) return true;
    const query = logSearchQuery.toLowerCase();
    const placementInfo = placements.find(p => p.id === log.placement);
    
    const resolvedName = (log.student_name || placementInfo?.student_name || '').toLowerCase();
    const resolvedId = (log.student || placementInfo?.student || '').toString().toLowerCase();
    const activities = (log.activities || '').toLowerCase();
    const weekString = `week ${log.week_number}`;
    
    return resolvedName.includes(query) || resolvedId.includes(query) || activities.includes(query) || weekString.includes(query);
  });

  const filteredPendingLogs = applySearchFilter(pendingLogs);
  const filteredApprovedLogs = applySearchFilter(reviewedLogs);

  const workloadData = Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1;
    const weekLogs = logs.filter(l => parseInt(l.week_number) === weekNum);
    return {
      name: `Week ${weekNum}`,
      Approved: weekLogs.filter(l => l.status === 'APPROVED').length,
      Pending: weekLogs.filter(l => l.status === 'SUBMITTED').length,
      Reviewed: weekLogs.filter(l => l.status === 'REVIEWED').length,
      Rejected: weekLogs.filter(l => l.status === 'REJECTED').length,
    };
  });

  const renderInternCard = (placement, index) => {
    const studentLogs = logs.filter(l => l.placement === placement.id || l.student === placement.student);
    const approvedCount = studentLogs.filter(l => l.status === 'APPROVED').length;
    const totalWeeks = 12; 
    
    const gaugeData = [
      { name: 'Approved', value: approvedCount },
      { name: 'Remaining', value: totalWeeks - approvedCount }
    ];

    const activityData = Array.from({ length: 12 }, (_, i) => {
      const weekNum = i + 1;
      const logForWeek = studentLogs.find(l => parseInt(l.week_number) === weekNum);
      const wordCount = logForWeek && logForWeek.activities ? logForWeek.activities.split(/\s+/).length : 0;
      return {
        name: `Week ${weekNum}`, 
        volume: wordCount,
        status: logForWeek ? logForWeek.status : 'MISSING'
      };
    });

    return (
      <div 
        key={placement.id}
        className="glass-card glow-blue" 
        onClick={() => setViewingIntern(placement)}
        style={{ 
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
          padding: '1.25rem 2rem', width: '100%', boxSizing: 'border-box', marginBottom: '1.5rem',
          cursor: 'pointer', transition: 'all 0.2s ease',
          animation: `slideUpFade 0.4s ease-out ${index * 0.1}s both`
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.transform = 'translateY(-4px)'; 
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'; 
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.transform = 'translateY(0)'; 
          e.currentTarget.style.boxShadow = 'none'; 
        }}
      >
        <div style={{ flex: '1 1 30%' }}>
          <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <span style={{ fontSize: '1.1rem' }}>👤</span> {placement.student_name || `Student ID: ${placement.student}`}
          </h3>
          <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 'bold' }}>
            🏢 {placement.company_name}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🗓️</span> {formatDisplayDate(placement.start_date)} - {formatDisplayDate(placement.end_date)}
          </p>
        </div>

        <div style={{ flex: '1 1 40%', height: '45px', padding: '0 1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <Tooltip content={<CustomSparklineTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                {activityData.map((entry, idx) => {
                  let strokeColor = 'rgba(255,255,255,0.15)'; 
                  let fillColor = 'rgba(255,255,255,0.05)';
                  let neonShadow = 'transparent';
                  
                  if (entry.status === 'APPROVED') { 
                    strokeColor = '#10b981'; fillColor = 'rgba(16, 185, 129, 0.2)'; neonShadow = 'rgba(16, 185, 129, 0.8)'; 
                  }
                  else if (entry.status === 'REJECTED') { 
                    strokeColor = '#ef4444'; fillColor = 'rgba(239, 68, 68, 0.2)'; neonShadow = 'rgba(239, 68, 68, 0.8)'; 
                  }
                  else if (entry.status === 'REVIEWED') { 
                    strokeColor = '#fef3c7'; fillColor = 'rgba(254, 243, 199, 0.2)'; neonShadow = 'rgba(254, 243, 199, 0.8)'; 
                  }
                  else if (entry.status === 'SUBMITTED') { 
                    strokeColor = '#eab308'; fillColor = 'rgba(250, 204, 21, 0.2)'; neonShadow = 'rgba(250, 204, 21, 0.8)'; 
                  }
                  
                  return <Cell key={`cell-${idx}`} fill={fillColor} stroke={strokeColor} strokeWidth={2} style={{ filter: `drop-shadow(0 0 6px ${neonShadow})` }}/>;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: '1 1 30%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--success-green)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Approval Progress
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white', lineHeight: '1.1' }}>
              {approvedCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 12 Weeks</span>
            </div>
          </div>
          <div style={{ position: 'relative', width: '90px', height: '50px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={30} outerRadius={42} dataKey="value" stroke="none" animationDuration={1500}>
                  <Cell fill="var(--success-green)" style={{ filter: 'drop-shadow(0 -2px 6px rgba(16, 185, 129, 0.6))' }} />
                  <Cell fill="rgba(255,255,255,0.05)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const getLogStudentDetails = (logObj) => {
    if (!logObj) return { name: '', id: '' };
    const placement = placements.find(p => p.id === logObj.placement);
    const name = logObj.student_name || placement?.student_name || 'Student';
    const id = logObj.student || placement?.student || 'N/A';
    return { name, id };
  };

  return (
    <div className="dark-dashboard" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <aside className="sidebar">
        <div className="sidebar-logo">ILES</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span className="icon">㗊</span> Overview</button>
          <button className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            <span className="icon">⏳</span> Pending Reviews
            {pendingLogs.length > 0 && (<span style={{ marginLeft: 'auto', background: '#eab308', color: 'black', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{pendingLogs.length}</span>)}
          </button>
          <button className={`nav-item ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}><span className="icon">✅</span> Approved Logs</button>
          <button className={`nav-item ${activeTab === 'interns' ? 'active' : ''}`} onClick={() => setActiveTab('interns')}><span className="icon">👥</span> My Interns</button>
        </nav>
      </aside>

      <main className="main-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header className="top-header">
          <div className="user-profile">
            <span className="welcome-text">Supervisor: {user?.username}</span>
            <div className="avatar" style={{background: '#6366f1'}}>💼</div>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <div className="content-scroll" style={{ flex: 1, padding: '1.5rem', overflowY: (reviewingLog || viewingLog || viewingIntern) ? 'hidden' : 'auto' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h1 className="page-title" style={{ marginBottom: '1rem', flexShrink: 0 }}>Workspace Command Hub</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem', flexShrink: 0 }}>
                <div className="glass-card glow-blue" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('interns')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Active Interns</h4></div>
                  <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-blue)', marginTop: '0.5rem' }}>{placements.length}</div>
                </div>
                
                <div className="glass-card glow-yellow" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('pending')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Pending Logs</h4></div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--warning-yellow)' }}>{pendingLogs.length}</span>
                  </div>
                </div>

                <div className="glass-card glow-green" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('approved')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Approved Logs</h4></div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--success-green)' }}>{reviewedLogs.length}</span>
                  </div>
                </div>
              </div>

              <section className="section-block" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="section-title">Team Review Analytics</h2>
                </div>
                
                <div className="glass-card glow-blue" style={{ flex: 1, padding: '1rem 2rem 1rem 0', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setChartType(prev => prev === 'bar' ? 'line' : 'bar')}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={workloadData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<WorkloadTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        
                        <Bar dataKey="Approved" stackId="a" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))' }} />
                        <Bar dataKey="Pending" stackId="a" fill="rgba(250, 204, 21, 0.2)" stroke="#eab308" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.8))' }} />
                        <Bar dataKey="Reviewed" stackId="a" fill="rgba(254, 243, 199, 0.2)" stroke="#fef3c7" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(254, 243, 199, 0.8))' }} />
                        <Bar dataKey="Rejected" stackId="a" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))' }} />
                      </BarChart>
                    ) : (
                      <LineChart data={workloadData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<WorkloadTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        
                        <Line type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }}/>
                        <Line type="monotone" dataKey="Pending" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#eab308', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.6))' }}/>
                        <Line type="monotone" dataKey="Reviewed" stroke="#fef3c7" strokeWidth={3} dot={{ r: 4, fill: '#fef3c7', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(254, 243, 199, 0.6))' }}/>
                        <Line type="monotone" dataKey="Rejected" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))' }}/>
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: PENDING REVIEWS */}
          {activeTab === 'pending' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Action Centre</h1>
                <input 
                  type="text" 
                  className="dark-input" 
                  placeholder="🔍 Search intern, ID, or activity..." 
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  style={{ width: '350px', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
              
              {actionMessage && (<div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: actionMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: actionMessage.type === 'error' ? '#fca5a5' : '#6ee7b7' }}>{actionMessage.text}</div>)}

              <section className="section-block">
                <h2 className="section-title">Requires Your Approval ({filteredPendingLogs.length})</h2>
                
                {filteredPendingLogs.length === 0 ? (
                  <div className="glass-card glow-green">
                    <p style={{ color: 'var(--success-green)', margin: 0, fontWeight: 'bold' }}>
                      {logSearchQuery ? 'No pending logs match your search.' : '✓ All caught up! No pending logs at the moment.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 260px)', justifyContent: 'center', gap: '1.5rem', paddingTop: '0.5rem' }}>
                    {filteredPendingLogs.map((log, index) => {
                      const resDetails = getLogStudentDetails(log);

                      return (
                        <div 
                          key={log.id} 
                          onClick={() => setReviewingLog(log)}
                          className={`glass-card ${log.status === 'REVIEWED' ? 'glow-white' : 'glow-yellow'}`}
                          style={{ 
                            height: '145px', 
                            borderRadius: '16px', 
                            padding: '1.25rem',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between', 
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${log.status === 'REVIEWED' ? 'rgba(254, 243, 199, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`,
                            borderLeft: `4px solid ${log.status === 'REVIEWED' ? '#fef3c7' : 'var(--warning-yellow)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            animation: `slideUpFade 0.3s ease-out ${index * 0.05}s both`,
                            boxSizing: 'border-box'
                          }}
                          onMouseEnter={(e) => { 
                            e.currentTarget.style.transform = 'translateY(-5px)'; 
                            e.currentTarget.style.background = log.status === 'REVIEWED' ? 'rgba(254, 243, 199, 0.1)' : 'rgba(250, 204, 21, 0.1)'; 
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'; 
                          }}
                          onMouseLeave={(e) => { 
                            e.currentTarget.style.transform = 'translateY(0)'; 
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; 
                            e.currentTarget.style.boxShadow = 'none'; 
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: '900', color: 'white', fontSize: '1.1rem' }}>Week {log.week_number}</div>
                              <div className={`status-badge ${log.status === 'REVIEWED' ? 'bg-white' : 'bg-yellow'}`} style={{ fontSize: '0.65rem', padding: '2px 6px', color: 'black', background: log.status === 'REVIEWED' ? '#fef3c7' : '' }}>
                                {log.status}
                              </div>
                            </div>
                            
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', marginTop: '8px', fontWeight: 'bold' }}>
                              👤 {resDetails.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              ID: {resDetails.id}
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {log.activities}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* TAB 3: APPROVED LOGS */}
          {activeTab === 'approved' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Approved Log Archive</h1>
                <input 
                  type="text" 
                  className="dark-input" 
                  placeholder="🔍 Search intern, ID, or activity..." 
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  style={{ width: '350px', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>

              <section className="section-block">
                <h2 className="section-title">Completed Reviews ({filteredApprovedLogs.length})</h2>
                
                {filteredApprovedLogs.length === 0 ? (
                  <div className="glass-card"><p className="text-muted">No approved logs match your search.</p></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 260px)', justifyContent: 'center', gap: '1.5rem', paddingTop: '0.5rem' }}>
                    {filteredApprovedLogs.map((log, index) => {
                      const resDetails = getLogStudentDetails(log);

                      return (
                        <div 
                          key={log.id} 
                          onClick={() => setViewingLog(log)}
                          className="glass-card glow-green"
                          style={{ 
                            height: '145px', 
                            borderRadius: '16px', 
                            padding: '1.25rem',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between', 
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderLeft: '4px solid var(--success-green)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            animation: `slideUpFade 0.3s ease-out ${index * 0.05}s both`,
                            boxSizing: 'border-box'
                          }}
                          onMouseEnter={(e) => { 
                            e.currentTarget.style.transform = 'translateY(-5px)'; 
                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; 
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'; 
                          }}
                          onMouseLeave={(e) => { 
                            e.currentTarget.style.transform = 'translateY(0)'; 
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; 
                            e.currentTarget.style.boxShadow = 'none'; 
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: '900', color: 'white', fontSize: '1.1rem' }}>Week {log.week_number}</div>
                              <div className="status-badge bg-green" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>APPROVED</div>
                            </div>
                            
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', marginTop: '8px', fontWeight: 'bold' }}>
                              👤 {resDetails.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              ID: {resDetails.id}
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {log.activities}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* TAB 4: MY INTERNS */}
          {activeTab === 'interns' && (
             <>
               <h1 className="page-title">Intern Directory</h1>
               <section className="section-block">
                 <h2 className="section-title">Currently Supervised Students</h2>
                 {placements.length === 0 ? (
                   <div className="glass-card"><p className="text-muted">No interns assigned to you yet.</p></div>
                 ) : (
                   <div>
                     {placements.map((placement, index) => renderInternCard(placement, index))}
                   </div>
                 )}
               </section>
             </>
          )}

        </div>
      </main>
      
      {/* ------------------------------------------------------------- */}
      {/* MACRO MODAL 1: THE REVIEW ACTION MODAL (PENDING LOGS)          */}
      {/* ------------------------------------------------------------- */}
      {reviewingLog && (() => {
        const modalStudent = getLogStudentDetails(reviewingLog);
        const modalThemeClass = reviewingLog.status === 'REVIEWED' ? 'glow-white' : 'glow-yellow';
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem',
            boxSizing: 'border-box'
          }}>
            <div className={`glass-card form-card ${modalThemeClass}`} style={{ width: '100%', maxWidth: '650px', padding: '2.5rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
              <button onClick={() => setReviewingLog(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', color: 'white' }}>Week {reviewingLog.week_number} Report</h2>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                    👤 {modalStudent.name} <span style={{color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.8rem'}}>| ID: {modalStudent.id}</span>
                  </div>
                </div>
                <span className={`status-badge ${reviewingLog.status === 'REVIEWED' ? 'bg-white' : 'bg-yellow'}`} style={{ color: 'black', background: reviewingLog.status === 'REVIEWED' ? '#fef3c7' : '' }}>
                  {reviewingLog.status === 'REVIEWED' ? 'REVIEWED' : 'NEEDS REVIEW'}
                </span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Activities Logged:</strong>
                {reviewingLog.activities}
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Supervisor Feedback (Mandatory for Action)</label>
                <textarea 
                  className="dark-input textarea" 
                  placeholder="Provide constructive feedback..." 
                  value={feedback[reviewingLog.id] || reviewingLog.supervisor_comment || ''} 
                  onChange={(e) => handleFeedbackChange(reviewingLog.id, e.target.value)} 
                  style={{ minHeight: '100px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleReviewTransition(reviewingLog.id, 'REVIEWED')} className="btn-submit" style={{ flex: '1 1 100%', background: '#fef3c7', color: 'black', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  👀 Mark as Reviewed (Keep Pending)
                </button>
                <button onClick={() => handleReviewTransition(reviewingLog.id, 'APPROVED')} className="btn-submit" style={{ flex: 1, background: 'var(--success-green)', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
                  ✓ Approve Log
                </button>
                <button onClick={() => handleReviewTransition(reviewingLog.id, 'REJECTED')} className="btn-submit" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.5)', fontSize: '1rem', fontWeight: 'bold' }}>
                  ✕ Return as Draft (Revision)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* MACRO MODAL 2: THE VIEW ARCHIVE MODAL (APPROVED LOGS)          */}
      {/* ------------------------------------------------------------- */}
      {viewingLog && (() => {
        const modalStudent = getLogStudentDetails(viewingLog);
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem',
            boxSizing: 'border-box'
          }}>
            <div className="glass-card form-card glow-green" style={{ width: '100%', maxWidth: '650px', padding: '2.5rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
              <button onClick={() => setViewingLog(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', color: 'white' }}>Week {viewingLog.week_number} Report</h2>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                    👤 {modalStudent.name} <span style={{color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.8rem'}}>| ID: {modalStudent.id}</span>
                  </div>
                </div>
                <span className="status-badge bg-green">APPROVED</span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Activities Logged:</strong>
                {viewingLog.activities}
              </div>

              {viewingLog.supervisor_comment && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
                  <strong style={{ color: '#6ee7b7', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Your Feedback:</strong>
                  <span style={{ color: 'white', fontSize: '0.95rem', lineHeight: '1.5' }}>{viewingLog.supervisor_comment}</span>
                </div>
              )}

              <div style={{ textAlign: 'right' }}>
                <button onClick={() => setViewingLog(null)} className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close Archive</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* MACRO MODAL 3: VIEW INTERN PROGRESS                            */}
      {/* ------------------------------------------------------------- */}
      {viewingIntern && (() => {
        const studentLogs = logs.filter(l => l.placement === viewingIntern.id || l.student === viewingIntern.student);
        const approvedCount = studentLogs.filter(l => l.status === 'APPROVED').length;
        const pendingCount = studentLogs.filter(l => l.status === 'SUBMITTED' || l.status === 'REVIEWED').length;
        const rejectedCount = studentLogs.filter(l => l.status === 'REJECTED').length;
        
        const internActivityData = Array.from({ length: 12 }, (_, i) => {
          const weekNum = i + 1;
          const logForWeek = studentLogs.find(l => parseInt(l.week_number) === weekNum);
          const wordCount = logForWeek && logForWeek.activities ? logForWeek.activities.split(/\s+/).length : 0;
          return {
            name: `Week ${weekNum}`, 
            volume: wordCount,
            status: logForWeek ? logForWeek.status : 'MISSING'
          };
        });

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem',
            boxSizing: 'border-box'
          }}>
            <div className="glass-card form-card glow-blue" style={{ width: '100%', maxWidth: '800px', padding: '2.5rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
              <button onClick={() => setViewingIntern(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
              
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Intern Progress Report</h2>
                <div style={{ fontSize: '1.1rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                  👤 {viewingIntern.student_name || 'Student'} <span style={{color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.9rem'}}>| ID: {viewingIntern.student || 'N/A'}</span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', color: 'white', fontSize: '0.95rem', lineHeight: '1.8' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Company:</strong> {viewingIntern.company_name}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Timeline:</strong> {formatDisplayDate(viewingIntern.start_date)} to {formatDisplayDate(viewingIntern.end_date)}</p>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--success-green)' }}><strong>Approved:</strong> {approvedCount} logs</p>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--warning-yellow)' }}><strong>Pending/Reviewed:</strong> {pendingCount} logs</p>
                    <p style={{ margin: '0', color: 'var(--error-red)' }}><strong>In Revision:</strong> {rejectedCount} logs</p>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Weekly Activity Volume</h4>
                  <div style={{ flex: 1, minHeight: '150px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={internActivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomSparklineTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Line type="monotone" dataKey="volume" stroke="var(--primary-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary-blue)', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button onClick={() => setViewingIntern(null)} className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close Report</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SupervisorDashboard;