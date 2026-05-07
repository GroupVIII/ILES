import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NotificationBell from './NotificationBell';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { toast } from 'react-toastify';

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

// --- CUSTOM NEON TOOLTIP ---
const CustomSparklineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let statusColor = '#fff';
    let displayStatus = data.status;
    
    if (data.status === 'APPROVED') statusColor = '#10b981'; 
    else if (data.status === 'REJECTED') { statusColor = '#ef4444'; displayStatus = 'DRAFT (REVISION)'; } 
    else if (data.status === 'REVIEWED') { statusColor = '#fef3c7'; displayStatus = 'REVIEWED'; } 
    else if (data.status === 'SUBMITTED') statusColor = '#3b82f6'; 
    else if (data.status === 'DRAFT') statusColor = '#eab308'; 

    return (
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px',
        padding: '8px 12px', color: '#ffffff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          {data.name}
        </div>
        <div style={{ marginBottom: '4px' }}>{data.volume} words logged</div>
        <div>Status: <span style={{ color: statusColor, fontWeight: '900', letterSpacing: '0.5px' }}>{displayStatus}</span></div>
      </div>
    );
  }
  return null;
};


const StudentDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [placements, setPlacements] = useState([]); 
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]); 
  const [criteriaList, setCriteriaList] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- UX STATES ---
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [viewingLog, setViewingLog] = useState(null);
  const [expandedPlacementId, setExpandedPlacementId] = useState(null);
  
  // MACRO MODAL STATE
  const [dashModal, setDashModal] = useState(null);
  
  const [chartType, setChartType] = useState('bar');
  const [editingLogId, setEditingLogId] = useState(null); 
  const [weekNumber, setWeekNumber] = useState('1');
  const [activities, setActivities] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null);

  // --- DOUBLE SCROLL LOCK ---
  useEffect(() => {
    if (viewingLog || isDraftModalOpen || dashModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [viewingLog, isDraftModalOpen, dashModal]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const placementRes = await api.get('/api/placements/');
        setPlacements(placementRes.data);
      } catch (error) { console.error("Failed to fetch Placements:", error); }

      try {
        const logsRes = await api.get('/api/logs/');
        setLogs(logsRes.data);
      } catch (error) { console.error("Failed to fetch Logs:", error); }

      try {
        const evalRes = await api.get('/api/evaluations/');
        setEvaluations(evalRes.data);
      } catch (error) { console.error("Failed to fetch Evaluations:", error); }

      try {
        const critRes = await api.get('/api/evaluation-criteria/');
        setCriteriaList(critRes.data);
      } catch (error) { console.error("Failed to fetch Criteria:", error); }

      setLoading(false);
    };
    fetchDashboardData();
  }, [activeTab]); 

  const activePlacement = placements.length > 0 ? placements[0] : null;

  const handleOpenNewLog = () => {
    setEditingLogId(null);
    
    // Automatically find the first unlogged week to set as the default
    const loggedWeeks = logs
      .filter(l => !activePlacement || l.placement === activePlacement.id)
      .map(l => parseInt(l.week_number));
    const firstAvailable = [1,2,3,4,5,6,7,8,9,10,11,12].find(num => !loggedWeeks.includes(num)) || 1;
    
    setWeekNumber(firstAvailable.toString());
    setActivities('');
    setSubmitMessage(null);
    setIsDraftModalOpen(true);
  };

  const handleEditDraftFromView = () => {
    if (!viewingLog) return;
    setEditingLogId(viewingLog.id);
    setWeekNumber(viewingLog.week_number.toString());
    setActivities(viewingLog.activities);
    setSubmitMessage(null);
    setViewingLog(null);
    setIsDraftModalOpen(true);
  };

  const closeDraftModal = () => {
    setIsDraftModalOpen(false);
    setSubmitMessage(null);
  };

  const togglePlacementExpand = (id) => {
    setExpandedPlacementId(expandedPlacementId === id ? null : id);
  };

  const handleSubmitLog = async (e, statusToSave) => {
    e.preventDefault(); 
    setSubmitMessage(null);

    if (!activePlacement) {
       setSubmitMessage({ type: 'error', text: 'No active placement to log against.' });
       return;
    }

    try {
      const payload = {
        placement: activePlacement.id,
        week_number: parseInt(weekNumber),
        activities: activities,
        start_date: '2026-05-11', 
        end_date: '2026-05-17', 
        status: statusToSave 
      };

      if (editingLogId) {
        const response = await api.patch(`/api/logs/${editingLogId}/`, payload);
        setLogs(logs.map(log => log.id === editingLogId ? response.data : log));
      } else {
        const response = await api.post('/api/logs/', payload);
        setLogs([...logs, response.data]); 
      }

      if (statusToSave === 'DRAFT') {
        toast.info("📝 Log safely saved as a draft.");
      } else {
        toast.success("✅ Log submitted successfully for approval!");
      }
      
      setTimeout(() => {
        setIsDraftModalOpen(false);
        setActivities(''); 
        setEditingLogId(null);
      }, 1500);

    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit the log. Please try again.");
    }
  };

  const radarData = evaluations.map(evaluation => {
    const crit = criteriaList.find(c => c.id === evaluation.criteria);
    return {
      subject: crit?.name || 'Unknown',
      score: Math.round(parseFloat(evaluation.score)),
      fullMark: 100,
    };
  });

  const activityData = Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1;
    const logForWeek = logs.find(l => parseInt(l.week_number) === weekNum);
    const wordCount = logForWeek && logForWeek.activities ? logForWeek.activities.split(/\s+/).length : 0;
    
    return {
      name: `Week ${weekNum}`, 
      volume: wordCount,
      status: logForWeek ? logForWeek.status : 'MISSING'
    };
  });

  const finalScore = parseFloat(activePlacement?.total_score || 0);

  if (loading) return <div className="dark-dashboard p-8">Loading your workspace...</div>;

  return (
    <div className="dark-dashboard" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <aside className="sidebar">
        <div className="sidebar-logo">ILES</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span className="icon">㗊</span> Overview</button>
          <button className={`nav-item ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}><span className="icon">📊</span> Performance</button>
          <button className={`nav-item ${activeTab === 'placements' ? 'active' : ''}`} onClick={() => setActiveTab('placements')}><span className="icon">📍</span> Placements</button>
          <button className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}><span className="icon">📄</span> Logs</button>
        </nav>
      </aside>

      <main className="main-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header className="top-header">
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="welcome-text">Welcome, {user?.username || 'Student'}</span>
            <div className="avatar">👤</div>
            <NotificationBell />
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <div className="content-scroll" style={{ flex: 1, padding: '1.5rem', overflowY: (viewingLog || isDraftModalOpen || dashModal) ? 'hidden' : 'auto' }}>
          
          {/* TAB 1: OVERVIEW (COMMAND HUB) */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h1 className="page-title" style={{ marginBottom: '1rem', flexShrink: 0 }}>Student Command Hub</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem', flexShrink: 0 }}>
                <div className="glass-card glow-blue" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('placements')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Active Placements</h4></div>
                  <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-blue)', marginTop: '0.5rem' }}>{placements.length}</div>
                </div>
                
                <div className="glass-card glow-yellow" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('logs')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Logbook Entries</h4></div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--warning-yellow)' }}>{logs.length}</span>
                  </div>
                </div>

                <div className={`glass-card ${activePlacement && evaluations.length > 0 ? 'glow-green' : 'glow-blue'}`} style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('performance')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Current Performance</h4></div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '900', color: activePlacement && evaluations.length > 0 ? 'var(--success-green)' : 'var(--primary-blue)' }}>
                      {activePlacement ? finalScore.toFixed(1) : 'N/A'}
                      {activePlacement && <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', opacity: 0.6, marginLeft: '4px' }}>/ 100</span>}
                    </span>
                  </div>
                </div>
              </div>

              <section className="section-block" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="section-title">Weekly Activity Trajectory</h2>
                </div>
                
                <div 
                  className="glass-card glow-blue" 
                  style={{ flex: 1, padding: '1rem 2rem 1rem 0', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => setChartType(prev => prev === 'bar' ? 'line' : 'bar')}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomSparklineTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                          {activityData.map((entry, idx) => {
                            let strokeColor = 'rgba(255,255,255,0.15)'; let fillColor = 'rgba(255,255,255,0.05)';
                            if (entry.status === 'APPROVED') { strokeColor = '#10b981'; fillColor = 'rgba(16, 185, 129, 0.4)'; } 
                            else if (entry.status === 'REJECTED') { strokeColor = '#ef4444'; fillColor = 'rgba(239, 68, 68, 0.4)'; } 
                            else if (entry.status === 'REVIEWED') { strokeColor = '#fef3c7'; fillColor = 'rgba(254, 243, 199, 0.4)'; }
                            else if (entry.status === 'SUBMITTED') { strokeColor = '#3b82f6'; fillColor = 'rgba(59, 130, 246, 0.4)'; } 
                            else if (entry.status === 'DRAFT') { strokeColor = '#eab308'; fillColor = 'rgba(250, 204, 21, 0.4)'; }
                            return <Cell key={`cell-${idx}`} fill={fillColor} stroke={strokeColor} strokeWidth={2} />;
                          })}
                        </Bar>
                      </BarChart>
                    ) : (
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomSparklineTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Line type="monotone" dataKey="volume" stroke="var(--primary-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary-blue)', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }}/>
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h1 className="page-title" style={{ marginBottom: '1rem', flexShrink: 0 }}>Academic Performance</h1>
              
              <div 
                className="glass-card glow-blue" 
                onClick={() => setDashModal('SUMMARY')}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', width: '100%', boxSizing: 'border-box', transition: 'all 0.2s ease', marginBottom: '1.5rem', flexShrink: 0 }}
              >
                <div style={{ flex: '1 1 30%' }}>
                  <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <span style={{ fontSize: '1.1rem' }}>🏢</span> {activePlacement?.company_name || 'Unassigned'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🗓️</span> {formatDisplayDate(activePlacement?.start_date)} - {formatDisplayDate(activePlacement?.end_date)}
                  </p>
                </div>

                <div style={{ flex: '1 1 40%', height: '45px', padding: '0 1.5rem', margin: '0 2rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <Tooltip content={<CustomSparklineTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
                        {activityData.map((entry, idx) => {
                          let strokeColor = 'rgba(255,255,255,0.15)'; 
                          let fillColor = 'rgba(255,255,255,0.05)';
                          let neonShadow = 'transparent';

                          if (entry.status === 'APPROVED') { strokeColor = '#10b981'; fillColor = 'rgba(16, 185, 129, 0.4)'; } 
                          else if (entry.status === 'REJECTED') { strokeColor = '#ef4444'; fillColor = 'rgba(239, 68, 68, 0.4)'; } 
                          else if (entry.status === 'REVIEWED') { strokeColor = '#fef3c7'; fillColor = 'rgba(254, 243, 199, 0.4)'; }
                          else if (entry.status === 'SUBMITTED') { strokeColor = '#3b82f6'; fillColor = 'rgba(59, 130, 246, 0.4)'; } 
                          else if (entry.status === 'DRAFT') { strokeColor = '#eab308'; fillColor = 'rgba(250, 204, 21, 0.4)'; }
                          
                          return <Cell key={`cell-${idx}`} fill={fillColor} stroke={strokeColor} strokeWidth={2} style={{ filter: `drop-shadow(0 0 6px ${neonShadow})` }} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 30%', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-blue)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>FINAL SCORE</span>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: 'white', lineHeight: '1.1' }}>
                      {finalScore.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', opacity: 0.5 }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ position: 'relative', width: '90px', height: '50px', marginLeft: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{value: finalScore}, {value: 100 - finalScore}]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={30} outerRadius={42} dataKey="value" stroke="none">
                          <Cell fill="var(--primary-blue)" style={{ filter: 'drop-shadow(0 -2px 6px rgba(59,130,246,0.6))' }} />
                          <Cell fill="rgba(255,255,255,0.05)" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                
                <div 
                  className="glass-card glow-blue" 
                  onClick={() => setDashModal('RADAR')}
                  style={{ display: 'flex', flexDirection: 'column', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem', textAlign: 'center' }}>Performance Distribution</h4>
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }} outerRadius="55%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.15)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Raw Score" dataKey="score" stroke="var(--primary-blue)" strokeWidth={2} fill="var(--primary-blue)" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div 
                  className="glass-card glow-green" 
                  onClick={() => setDashModal('RESULTS')}
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.2s ease', overflow: 'hidden' }}
                >
                  <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ margin: 0 }}>Detailed Results</h4>
                    <span className="status-badge bg-green">GRADED ✓</span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', overflowY: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'fixed' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 1 }}>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.8rem 1rem', width: '50%' }}>Syllabus Criteria</th>
                          <th style={{ padding: '0.8rem 1rem', width: '25%', textAlign: 'center' }}>Weight</th>
                          <th style={{ padding: '0.8rem 1rem', width: '25%', textAlign: 'right' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluations.length > 0 ? evaluations.map((evaluation, index) => {
                          const crit = criteriaList.find(c => c.id === evaluation.criteria);
                          return (
                            <tr key={evaluation.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'white' }}>{crit?.name || 'Unknown Standard'}</td>
                              <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)', textAlign: 'center' }}>{parseFloat(crit?.weight || 0)}%</td>
                              <td style={{ padding: '0.8rem 1rem', color: 'var(--success-green)', fontWeight: 'bold', textAlign: 'right', fontSize: '1rem' }}>{Math.round(parseFloat(evaluation.score))}</td>
                            </tr>
                          );
                        }) : (
                          <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No grades submitted yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid var(--success-green)', flexShrink: 0 }}>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>Supervisor Comments:</strong> "{evaluations[0]?.comments || 'No specific comments provided.'}"
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: PLACEMENTS DOSSIER */}
          {activeTab === 'placements' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h1 className="page-title">Placement Directory</h1>
                <h2 className="section-title" style={{ marginTop: '0.5rem' }}>My Assignments</h2>
                 
                 {placements.length === 0 ? (
                   <div className="glass-card"><p className="text-muted">No active placements assigned yet.</p></div>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {placements.map((p, index) => {
                       const isExpanded = expandedPlacementId === p.id;
                       const placementLogs = logs.filter(l => l.placement === p.id);
                       const approvedLogs = placementLogs.filter(l => l.status === 'APPROVED').length;
                       
                       return (
                         <div 
                           key={p.id} 
                           className="glass-card form-card glow-blue" 
                           style={{ animation: `slideUpFade 0.4s ease-out ${index * 0.1}s both`, padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                           onClick={() => togglePlacementExpand(p.id)}
                         >
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div>
                               <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>
                                 🏢 {p.company_name}
                               </h3>
                               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                 {formatDisplayDate(p.start_date)} - {formatDisplayDate(p.end_date)}
                               </p>
                             </div>
                             
                             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                               <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                 <span style={{ fontSize: '0.7rem', color: 'var(--primary-blue)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Logs Approved</span>
                                 <div className="status-badge bg-blue" style={{ marginTop: '4px' }}>
                                   {approvedLogs} / 12
                                 </div>
                               </div>
                               <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                 {isExpanded ? '▲' : '▼'}
                               </div>
                             </div>
                           </div>

                           {isExpanded && (
                             <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'slideUpFade 0.3s ease-out' }}>
                               
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                 <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px' }}>
                                   <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                     Supervisory Contacts
                                   </h4>
                                   
                                   <div style={{ marginBottom: '1rem' }}>
                                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Workplace Guide (ID: {p.workplace_supervisor || 'N/A'})</div>
                                     <div style={{ color: p.workplace_supervisor ? 'var(--success-green)' : '#fca5a5', fontWeight: 'bold' }}>
                                       {p.workplace_supervisor ? 'Assigned & Active' : '⚠️ Pending Assignment'}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Academic Overseer (ID: {p.academic_supervisor || 'N/A'})</div>
                                     <div style={{ color: p.academic_supervisor ? '#a78bfa' : '#fca5a5', fontWeight: 'bold' }}>
                                       {p.academic_supervisor ? 'Assigned & Active' : '⚠️ Pending Assignment'}
                                     </div>
                                   </div>
                                 </div>

                                 <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                     <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Logs Submitted:</span>
                                     <span style={{ color: 'white', fontWeight: 'bold' }}>{placementLogs.length}</span>
                                   </div>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                     <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending Review:</span>
                                     <span style={{ color: 'var(--warning-yellow)', fontWeight: 'bold' }}>{placementLogs.filter(l => l.status === 'SUBMITTED').length}</span>
                                   </div>
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Needs Revision:</span>
                                     <span style={{ color: 'var(--error-red)', fontWeight: 'bold' }}>{placementLogs.filter(l => l.status === 'REJECTED').length}</span>
                                   </div>
                                 </div>
                               </div>
                               
                               <div style={{ textAlign: 'right' }}>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveTab('logs'); }}
                                    style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                  >
                                    Manage Logs for this Placement ➔
                                  </button>
                               </div>

                             </div>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 )}
             </div>
          )}

          {/* TAB 4: LOGS */}
          {activeTab === 'logs' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Log History</h1>
                    <button onClick={handleOpenNewLog} style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ Draft New Log</button>
                </div>
                {logs.map((log) => {
                    let indicator = 'rgba(255,255,255,0.1)';
                    let displayStatText = 'View ➔';
                    
                    if (log.status === 'APPROVED') indicator = '#10b981';
                    else if (log.status === 'SUBMITTED') indicator = '#3b82f6';
                    else if (log.status === 'REVIEWED') indicator = '#fef3c7';
                    else if (log.status === 'DRAFT') indicator = '#eab308';
                    else if (log.status === 'REJECTED') { 
                      indicator = '#ef4444'; 
                      displayStatText = 'Needs Revision ➔'; 
                    }

                    return (
                        <div key={log.id} onClick={() => setViewingLog(log)} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer', borderLeft: `4px solid ${indicator}`, transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                            <div style={{ flex: '0 0 100px', fontWeight: 'bold' }}>Week {log.week_number}</div>
                            <div style={{ flex: 1, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>{log.activities}</div>
                            <div style={{ flex: '0 0 120px', textAlign: 'right', color: log.status === 'REJECTED' ? '#ef4444' : 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: log.status === 'REJECTED' ? 'bold' : 'normal' }}>
                              {displayStatText}
                            </div>
                        </div>
                    );
                })}
             </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MACRO MODALS (FULL SCREEN BLUR)                                */}
      {/* ------------------------------------------------------------- */}

      {dashModal && (() => {
        let title = '';
        let content = null;
        let theme = 'glow-blue';

        if (dashModal === 'SUMMARY') {
          title = 'Placement Summary & Activity Timeline';
          content = (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', color: 'white', fontSize: '0.95rem', lineHeight: '1.8' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Company:</strong> {activePlacement?.company_name}</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Timeline:</strong> {formatDisplayDate(activePlacement?.start_date)} to {formatDisplayDate(activePlacement?.end_date)}</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Workplace Supervisor ID:</strong> {activePlacement?.workplace_supervisor || 'Pending'}</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Academic Supervisor ID:</strong> {activePlacement?.academic_supervisor || 'Pending'}</p>
                <p style={{ margin: 0, color: 'var(--primary-blue)', fontWeight: 'bold' }}>Current Weighted Score: {parseFloat(activePlacement?.total_score || 0).toFixed(1)} / 100</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Weekly Activity Volume</h4>
                <div style={{ flex: 1, minHeight: '150px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomSparklineTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                      <Line type="monotone" dataKey="volume" stroke="var(--primary-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary-blue)', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        } else if (dashModal === 'RADAR') {
          title = 'Syllabus Competency Breakdown';
          content = (
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }} outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 14, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="score" stroke="var(--primary-blue)" strokeWidth={3} fill="var(--primary-blue)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          );
        } else if (dashModal === 'RESULTS') {
          title = 'Complete Evaluation Report';
          theme = 'glow-green';
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '1rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 10 }}>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem 1.5rem' }}>Criteria</th>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Weight</th>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.length > 0 ? evaluations.map(e => {
                      const crit = criteriaList.find(c => c.id === e.criteria);
                      return (
                        <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold', color: 'white' }}>{crit?.name || 'Unknown Standard'}</td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>{parseFloat(crit?.weight || 0)}%</td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--success-green)', fontWeight: 'bold' }}>{Math.round(e.score)}</td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No grades submitted yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--success-green)', overflowWrap: 'anywhere' }}>
                <strong style={{ display: 'block', color: 'var(--success-green)', marginBottom: '0.5rem' }}>Supervisor's Final Remarks:</strong>
                <span style={{ color: 'white', lineHeight: '1.6' }}>"{evaluations[0]?.comments || 'No holistic feedback provided.'}"</span>
              </div>
            </div>
          );
        }

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
              <div className={`glass-card ${theme}`} style={{ width: '100%', maxWidth: dashModal === 'RADAR' ? '600px' : '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '2.5rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out' }}>
                  <button onClick={() => setDashModal(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>✕</button>
                  <h2 style={{ color: 'white', marginBottom: '1.5rem', marginTop: 0, textAlign: dashModal === 'RADAR' ? 'center' : 'left' }}>{title}</h2>
                  {content}
                  
                  <div style={{ textAlign: dashModal === 'SUMMARY' ? 'left' : 'center', marginTop: '2rem' }}>
                    <button onClick={() => setDashModal(null)} className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close Details</button>
                  </div>
              </div>
          </div>
        );
      })()}

      {viewingLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', boxSizing: 'border-box' }}>
          <div className={`glass-card form-card ${viewingLog.status === 'APPROVED' ? 'glow-green' : viewingLog.status === 'REJECTED' ? 'glow-red' : viewingLog.status === 'REVIEWED' ? 'glow-yellow' : viewingLog.status === 'SUBMITTED' ? 'glow-blue' : 'glow-yellow'}`} style={{ width: '100%', maxWidth: '650px', padding: '2.5rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setViewingLog(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Week {viewingLog.week_number} Report
              </h2>
              <div className={`status-badge ${viewingLog.status === 'APPROVED' ? 'bg-green' : viewingLog.status === 'REJECTED' ? 'bg-red' : viewingLog.status === 'REVIEWED' ? 'bg-white' : viewingLog.status === 'SUBMITTED' ? 'bg-blue' : 'bg-yellow'}`} style={{ fontSize: '0.85rem', padding: '6px 12px', color: viewingLog.status === 'REVIEWED' ? 'black' : 'inherit', background: viewingLog.status === 'REVIEWED' ? '#fef3c7' : '' }}>
                  {viewingLog.status === 'REJECTED' ? 'DRAFT (REVISION)' : viewingLog.status}
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {viewingLog.activities}
            </div>

            {(viewingLog.status === 'REJECTED' || viewingLog.status === 'REVIEWED') && viewingLog.supervisor_comment && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '1.5rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                <strong style={{ color: '#fca5a5', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Supervisor Feedback:</strong>
                <span style={{ color: 'white', fontSize: '0.95rem', lineHeight: '1.5' }}>{viewingLog.supervisor_comment}</span>
              </div>
            )}

            {viewingLog.status === 'APPROVED' && viewingLog.supervisor_comment && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '1.5rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                <strong style={{ color: '#6ee7b7', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Supervisor Note:</strong>
                <span style={{ color: 'white', fontSize: '0.95rem', lineHeight: '1.5' }}>{viewingLog.supervisor_comment}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setViewingLog(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
              
              {(viewingLog.status === 'DRAFT' || viewingLog.status === 'REJECTED') && (
                <button onClick={handleEditDraftFromView} style={{ background: 'var(--warning-yellow)', color: 'black', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900' }}>
                  ✏️ Edit Draft
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isDraftModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', boxSizing: 'border-box' }}>
          <div className="glass-card form-card glow-blue" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out' }}>
            <button onClick={closeDraftModal} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'white' }}>{editingLogId ? '✏️ Edit Draft' : '📝 Draft a New Log'}</h2>
            
            <form>
              {submitMessage && (<div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: submitMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: submitMessage.type === 'error' ? '#fca5a5' : '#6ee7b7' }}>{submitMessage.text}</div>)}
              
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label>Week Number</label>
                <select className="dark-input" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} disabled={editingLogId !== null}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => {
                    // Check if this specific week is already logged for the active placement
                    const isAlreadyLogged = logs.some(l => parseInt(l.week_number) === num && (!activePlacement || l.placement === activePlacement.id));
                    const isDisabled = isAlreadyLogged && editingLogId === null;
                    
                    return (
                      <option 
                        key={num} 
                        value={num} 
                        disabled={isDisabled}
                        style={{ color: isDisabled ? 'rgba(255,255,255,0.3)' : 'inherit' }}
                      >
                        Week {num} {isDisabled ? '(Already Logged)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label>Activities Completed</label>
                <textarea className="dark-input textarea" placeholder="Describe your tasks, challenges, and learnings..." value={activities} onChange={(e) => setActivities(e.target.value)} style={{ minHeight: '150px' }} required></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn-submit" style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-main)' }} onClick={(e) => handleSubmitLog(e, 'DRAFT')}>Save as Draft</button>
                <button type="button" className="btn-submit" style={{ flex: 2, background: 'var(--primary-blue)', color: 'white' }} onClick={(e) => handleSubmitLog(e, 'SUBMITTED')}>Submit for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;