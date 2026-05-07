import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid
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

// --- CUSTOM NEON TOOLTIP FOR RUBRIC SPARKLINE ---
const CustomRubricTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.5)', borderRadius: '6px',
        padding: '8px 12px', color: '#ffffff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          {data.subject}
        </div>
        <div>
          Raw Score: <span style={{ color: '#a78bfa', fontWeight: '900', letterSpacing: '0.5px' }}>{data.score}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '10px' }}>
          Weight: {data.weight}% of Total
        </div>
      </div>
    );
  }
  return null;
};

// --- CUSTOM TOOLTIP FOR LOG ACTIVITY LINE CHART ---
const CustomActivityTooltip = ({ active, payload }) => {
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
        backgroundColor: 'rgba(15, 23, 42, 0.95)', border: `1px solid ${statusColor}`, borderRadius: '6px',
        padding: '8px 12px', color: '#ffffff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          {data.name}
        </div>
        <div style={{ marginBottom: '4px' }}>{data.volume} words logged</div>
        {data.status && data.status !== 'MISSING' && (
          <div>Status: <span style={{ color: statusColor, fontWeight: '900', letterSpacing: '0.5px' }}>{displayStatus}</span></div>
        )}
      </div>
    );
  }
  return null;
};

const AcademicSupervisorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview'); 

  const [placements, setPlacements] = useState([]);
  const [criteriaList, setCriteriaList] = useState([]); 
  const [existingEvaluations, setExistingEvaluations] = useState([]); 
  const [logs, setLogs] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [selectedPlacement, setSelectedPlacement] = useState('');
  const [scores, setScores] = useState({}); 
  const [comments, setComments] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false); 

  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [viewingIntern, setViewingIntern] = useState(null); 
  const [viewingLog, setViewingLog] = useState(null);
  
  const [chartType, setChartType] = useState('bar');

  // --- DOUBLE SCROLL LOCK ---
  useEffect(() => {
    if (viewingIntern || viewingLog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [viewingIntern, viewingLog]);

  useEffect(() => {
    const fetchAcademicData = async () => {
      setLoading(true);
      try {
        const placementRes = await api.get('/api/placements/');
        setPlacements(placementRes.data);
      } catch (e) { console.error(e); }

      try {
        const criteriaRes = await api.get('/api/evaluation-criteria/');
        setCriteriaList(criteriaRes.data);
      } catch (e) { console.error(e); }

      try {
        const evalRes = await api.get('/api/evaluations/');
        setExistingEvaluations(evalRes.data);
      } catch (e) { console.error(e); }

      try {
        // NOTE: The Academic Supervisor currently ONLY fetches APPROVED logs according to the original code
        const logsRes = await api.get('/api/logs/');
        setLogs(logsRes.data.filter(log => log.status === 'APPROVED'));
      } catch (e) { console.error(e); }

      setLoading(false);
    };
    fetchAcademicData();
  }, [activeTab]); 

  useEffect(() => {
    if (selectedPlacement) {
      const evalsForStudent = existingEvaluations.filter(
        (e) => e.placement === parseInt(selectedPlacement) && e.evaluator === user.id
      );
      
      const loadedScores = {};
      let loadedComments = '';
      
      evalsForStudent.forEach(e => {
        loadedScores[e.criteria] = e.score;
        if (e.comments) loadedComments = e.comments;
      });
      
      setScores(loadedScores);
      setComments(loadedComments);
      setSubmitMessage(null); 
      setIsEditing(evalsForStudent.length > 0); 
    } else {
      setScores({});
      setComments('');
      setIsEditing(false);
    }
  }, [selectedPlacement, existingEvaluations, user.id]);

  const handleScoreChange = (criteriaId, value) => {
    setScores({ ...scores, [criteriaId]: value });
  };

  const jumpToGrading = (placementId) => {
    setViewingIntern(null); 
    setSelectedPlacement(placementId.toString());
    setActiveTab('gradebook');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (isEditing) return;

    const criteriaToSubmit = Object.entries(scores).filter(([id, val]) => val !== '' && val !== null);

    if (criteriaToSubmit.length === 0) {
      setSubmitMessage({ type: 'error', text: 'Please enter at least one score.' });
      return;
    }

    try {
      const submissionPromises = criteriaToSubmit.map(([critId, rawScore]) => {
        const payload = {
          evaluator: user.id,
          placement: selectedPlacement,
          criteria: critId, 
          score: parseInt(rawScore),
          comments: comments 
        };
        return api.post('/api/evaluations/', payload); 
      });

      await Promise.all(submissionPromises);

      const updatedEvals = await api.get('/api/evaluations/');
      setExistingEvaluations(updatedEvals.data);
      const updatedPlacements = await api.get('/api/placements/');
      setPlacements(updatedPlacements.data);

      setSubmitMessage({ type: 'success', text: 'Academic evaluation officially submitted and locked.' });
      setIsEditing(true);

    } catch (error) {
      console.error("Evaluation failed:", error);
      setSubmitMessage({ type: 'error', text: 'Failed to submit evaluations. Check network tab.' });
    }
  };

  const getLogStudentDetails = (logObj) => {
    if (!logObj) return { name: '', id: '' };
    const placement = placements.find(p => p.id === logObj.placement);
    const name = logObj.student_name || placement?.student_name || 'Student';
    const id = logObj.student || placement?.student || 'N/A';
    return { name, id };
  };

  const filteredApprovedLogs = logs.filter(log => {
    if (!logSearchQuery) return true;
    const query = logSearchQuery.toLowerCase();
    const placementInfo = placements.find(p => p.id === log.placement);
    
    const resolvedName = (log.student_name || placementInfo?.student_name || '').toLowerCase();
    const resolvedId = (log.student || placementInfo?.student || '').toString().toLowerCase();
    const activities = (log.activities || '').toLowerCase();
    const weekString = `week ${log.week_number}`;
    
    return resolvedName.includes(query) || resolvedId.includes(query) || activities.includes(query) || weekString.includes(query);
  });

  if (loading) return <div className="dark-dashboard p-8">Loading academic portal...</div>;

  const ungradedCount = placements.filter(p => !existingEvaluations.some(e => e.placement === p.id)).length;

  const overviewChartData = Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1;
    const weekLogs = logs.filter(l => parseInt(l.week_number) === weekNum);
    return {
      name: `Week ${weekNum}`,
      Approved: weekLogs.length
    };
  });

  const renderStudentCard = (placement, index) => {
    const studentEvals = existingEvaluations.filter(e => e.placement === placement.id);
    const isGraded = studentEvals.length > 0;
    const score = parseFloat(placement.total_score || 0);

    const gaugeData = [
      { name: 'Score', value: score },
      { name: 'Remaining', value: 100 - score }
    ];

    const rubricData = criteriaList.map(crit => {
      const evalRecord = studentEvals.find(e => e.criteria === crit.id);
      return {
        subject: crit.name,
        weight: parseFloat(crit.weight),
        score: evalRecord ? Math.round(parseFloat(evalRecord.score)) : 0
      };
    });

    return (
      <div 
        key={placement.id} 
        onClick={() => setViewingIntern(placement)}
        className={`glass-card ${isGraded ? 'glow-green' : 'glow-yellow'}`}
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
        <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <span style={{ fontSize: '1.1rem' }}>🎓</span> {placement.student_name || `Student ID: ${placement.student}`}
            </h3>
            <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 'bold' }}>
              🏢 {placement.company_name}
            </div>
          </div>
          
          {!isGraded ? (
            <button 
              onClick={(e) => { e.stopPropagation(); jumpToGrading(placement.id); }}
              style={{ 
                background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)',
                color: '#fde047', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', 
                width: 'fit-content', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold'
              }}
            >
              ⚖️ Evaluate Now
            </button>
          ) : (
            <div style={{ 
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', 
                width: 'fit-content', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold'
            }}>
              ✓ Evaluation Locked
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 40%', height: '50px', padding: '0 1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          {isGraded ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rubricData}>
                <Tooltip content={<CustomRubricTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {rubricData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.8))' }}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-yellow)', fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.7 }}>
              Awaiting Evaluation...
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 30%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: isGraded ? 'var(--success-green)' : 'var(--warning-yellow)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Final Grade
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white', lineHeight: '1.1' }}>
              {score.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>
          <div style={{ position: 'relative', width: '90px', height: '50px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={30} outerRadius={42} dataKey="value" stroke="none" animationDuration={1500}>
                  <Cell fill={isGraded ? "var(--success-green)" : "var(--warning-yellow)"} style={{ filter: `drop-shadow(0 -2px 6px ${isGraded ? 'rgba(16, 185, 129, 0.6)' : 'rgba(250, 204, 21, 0.6)'})` }} />
                  <Cell fill="rgba(255,255,255,0.05)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dark-dashboard" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <aside className="sidebar">
        <div className="sidebar-logo">ILES</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span className="icon">㗊</span> Overview
          </button>
          <button className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <span className="icon">🎓</span> My Students
          </button>
          <button className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <span className="icon">📄</span> Approved Logs
          </button>
          <button className={`nav-item ${activeTab === 'gradebook' ? 'active' : ''}`} onClick={() => setActiveTab('gradebook')}>
            <span className="icon">📊</span> Gradebook
            {ungradedCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#eab308', color: 'black', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {ungradedCount}
              </span>
            )}
          </button>
        </nav>
      </aside>

      <main className="main-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header className="top-header">
          <div className="user-profile">
            <span className="welcome-text">Academic Supervisor: {user?.username}</span>
            <div className="avatar">🎓</div>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <div className="content-scroll" style={{ flex: 1, padding: '1.5rem', overflowY: (viewingIntern || viewingLog) ? 'hidden' : 'auto' }}>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h1 className="page-title" style={{ marginBottom: '1rem', flexShrink: 0 }}>Academic Command Hub</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem', flexShrink: 0 }}>
                <div className="glass-card glow-blue" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('students')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Assigned Students</h4></div>
                  <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-blue)', marginTop: '0.5rem' }}>{placements.length}</div>
                </div>
                
                <div className="glass-card glow-green" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('logs')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Approved Logs</h4></div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--success-green)' }}>{logs.length}</span>
                  </div>
                </div>

                <div className={`glass-card ${ungradedCount > 0 ? 'glow-yellow' : 'glow-blue'}`} style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActiveTab('gradebook')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-header"><h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Pending Evaluations</h4></div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '900', color: ungradedCount > 0 ? 'var(--warning-yellow)' : 'var(--primary-blue)' }}>{ungradedCount}</span>
                  </div>
                </div>
              </div>

              <section className="section-block" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="section-title">Approved Log Trajectory</h2>
                </div>
                
                <div 
                  className="glass-card glow-green" 
                  style={{ flex: 1, padding: '1rem 2rem 1rem 0', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => setChartType(prev => prev === 'bar' ? 'line' : 'bar')}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={overviewChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--success-green)', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="Approved" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))' }} />
                      </BarChart>
                    ) : (
                      <LineChart data={overviewChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" tick={{fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--success-green)', borderRadius: '8px', color: '#fff' }} />
                        <Line type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }}/>
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: STUDENTS (ROSTER) */}
          {activeTab === 'students' && (
            <>
              <h1 className="page-title">Academic Roster</h1>
              <section className="section-block">
                <h2 className="section-title">Student Placements & Computations</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {placements.length === 0 ? (
                     <div className="glass-card"><p className="text-muted">No students assigned to you yet.</p></div>
                  ) : (
                    placements.map((placement, index) => renderStudentCard(placement, index))
                  )}
                </div>
              </section>
            </>
          )}

          {/* TAB 3: APPROVED LOGS */}
          {activeTab === 'logs' && (
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
                <h2 className="section-title">Verified Workplace Activities ({filteredApprovedLogs.length})</h2>
                
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

          {/* TAB 4: GRADEBOOK */}
          {activeTab === 'gradebook' && (
            <>
              <h1 className="page-title">Gradebook</h1>
              <section className="section-block mt-4">
                <h2 className="section-title">Submit Official Academic Evaluation</h2>
                <form onSubmit={handleGradeSubmission} className="glass-card form-card glow-blue">
                  
                  {submitMessage && (
                    <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', 
                                  backgroundColor: submitMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                  color: submitMessage.type === 'error' ? '#fca5a5' : '#6ee7b7' }}>
                      {submitMessage.text}
                    </div>
                  )}

                  {isEditing && (
                     <div style={{ marginBottom: '1.5rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '3px solid #ef4444' }}>
                       <span>🔒</span> <strong>Evaluation Locked:</strong> This student has already been officially graded. The rubric is locked and cannot be edited.
                     </div>
                  )}

                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label>1. Select Student Placement</label>
                    <select 
                      className="dark-input"
                      value={selectedPlacement}
                      onChange={(e) => setSelectedPlacement(e.target.value)}
                      required
                    >
                      <option value="" disabled>-- Select an ungraded student --</option>
                      {placements.map(p => {
                        const isAlreadyEvaluated = existingEvaluations.some(e => e.placement === p.id);
                        return (
                          <option 
                            key={p.id} 
                            value={p.id} 
                            disabled={isAlreadyEvaluated}
                            style={{ color: isAlreadyEvaluated ? 'rgba(255,255,255,0.3)' : 'inherit' }}
                          >
                            {p.student_name || p.student} - {p.company_name} {isAlreadyEvaluated ? ' (Evaluation Locked)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label>2. Enter Rubric Scores</label>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
                      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                            <th style={{ paddingBottom: '0.5rem', width: '25%' }}>Evaluation Criteria</th>
                            <th style={{ paddingBottom: '0.5rem', width: '60%', textAlign: 'center' }}>Weight</th>
                            <th style={{ paddingBottom: '0.5rem', width: '25%' }}>Raw Score Given</th>
                          </tr>
                        </thead>
                        <tbody>
                          {criteriaList.map((crit) => (
                            <tr key={crit.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.75rem 0', fontWeight: 'bold', opacity: isEditing ? 0.5 : 1 }}>
                                {crit.name}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 'normal' }}>
                                  {crit.description}
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem 0', color: 'var(--warning-yellow)', textAlign: 'center', opacity: isEditing ? 0.5 : 1 }}>
                                {Math.round(parseFloat(crit.weight))}%
                              </td>
                              <td style={{ padding: '0.75rem 0' }}>
                                <input 
                                  type="number" 
                                  className="dark-input" 
                                  min="0"
                                  max="100"
                                  placeholder="Score"
                                  value={scores[crit.id] || ''}
                                  onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                                  style={{ padding: '8px', width: '120px', textAlign: 'center', opacity: isEditing ? 0.5 : 1 }}
                                  disabled={isEditing}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>3. Overall Academic Comments / Feedback</label>
                    <textarea 
                      className="dark-input textarea" 
                      placeholder="Provide final academic assessment notes..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      required
                      disabled={isEditing}
                      style={{ opacity: isEditing ? 0.5 : 1 }}
                    ></textarea>
                  </div>

                  {!isEditing && (
                    <button type="submit" className="btn-submit mt-4" style={{ background: 'var(--primary-blue)', color: '#fff' }}>
                      Save Rubric & Compute Final Score
                    </button>
                  )}
                </form>
              </section>
            </>
          )}

        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MACRO MODAL 1: VIEW INTERN DOSSIER                            */}
      {/* ------------------------------------------------------------- */}
      {viewingIntern && (() => {
        const studentEvals = existingEvaluations.filter(e => e.placement === viewingIntern.id);
        const isGraded = studentEvals.length > 0;
        
        const internActivityData = Array.from({ length: 12 }, (_, i) => {
          const weekNum = i + 1;
          const logForWeek = logs.find(l => (l.placement === viewingIntern.id || l.student === viewingIntern.student) && parseInt(l.week_number) === weekNum);
          const wordCount = logForWeek && logForWeek.activities ? logForWeek.activities.split(/\s+/).length : 0;
          return {
            name: `Week ${weekNum}`, 
            volume: wordCount,
            status: logForWeek ? logForWeek.status : 'MISSING' // 👈 Added status for the tooltip
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
            <div className={`glass-card form-card ${isGraded ? 'glow-green' : 'glow-yellow'}`} style={{ width: '100%', maxWidth: '800px', padding: '2.5rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
              <button onClick={() => setViewingIntern(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
              
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Student Academic Dossier</h2>
                  <div style={{ fontSize: '1.1rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                    👤 {viewingIntern.student_name || 'Student'} <span style={{color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.9rem'}}>| ID: {viewingIntern.student || 'N/A'}</span>
                  </div>
                </div>
                {isGraded ? (
                  <div className="status-badge bg-green" style={{ fontSize: '0.85rem' }}>EVALUATION LOCKED ✓</div>
                ) : (
                  <button 
                    onClick={() => jumpToGrading(viewingIntern.id)}
                    className="btn-submit"
                    style={{ background: 'var(--warning-yellow)', color: 'black', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem' }}
                  >
                    ⚖️ Evaluate Now
                  </button>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', color: 'white', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Company:</strong> {viewingIntern.company_name}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Timeline:</strong> {formatDisplayDate(viewingIntern.start_date)} to {formatDisplayDate(viewingIntern.end_date)}</p>
                  
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Rubric Breakdown</h4>
                    {isGraded ? (
                      criteriaList.map(crit => {
                        const scoreRecord = studentEvals.find(e => e.criteria === crit.id);
                        return (
                          <div key={crit.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{crit.name}:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--success-green)' }}>{scoreRecord ? Math.round(scoreRecord.score) : 0} / 100</span>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ color: 'var(--warning-yellow)', fontStyle: 'italic', fontSize: '0.85rem' }}>Pending final grading.</div>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                     <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary-blue)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Computed Final Score</span>
                     <span style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>{parseFloat(viewingIntern.total_score || 0).toFixed(1)} <span style={{ fontSize: '1rem', opacity: 0.5 }}>/ 100</span></span>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Approved Log Volume</h4>
                  <div style={{ flex: 1, minHeight: '150px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={internActivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        {/* THE FIX: Added transparent dashed line cursor for LineChart */}
                        <Tooltip content={<CustomActivityTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Line type="monotone" dataKey="volume" stroke="var(--success-green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--success-green)', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
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
            {/* 👈 FIX: Dynamic Theme based on log state */}
            <div className={`glass-card form-card ${viewingLog.status === 'APPROVED' ? 'glow-green' : viewingLog.status === 'REJECTED' ? 'glow-red' : viewingLog.status === 'REVIEWED' ? 'glow-white' : 'glow-yellow'}`} style={{ width: '100%', maxWidth: '650px', padding: '2.5rem', position: 'relative', animation: 'slideUpFade 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
              <button onClick={() => setViewingLog(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', color: 'white' }}>Week {viewingLog.week_number} Report</h2>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                    👤 {modalStudent.name} <span style={{color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.8rem'}}>| ID: {modalStudent.id}</span>
                  </div>
                </div>
                {/* 👈 FIX: Dynamic Badge based on log state */}
                <span className={`status-badge ${viewingLog.status === 'APPROVED' ? 'bg-green' : viewingLog.status === 'REJECTED' ? 'bg-red' : viewingLog.status === 'REVIEWED' ? 'bg-white' : 'bg-yellow'}`} style={{ color: viewingLog.status === 'REVIEWED' ? 'black' : 'inherit', background: viewingLog.status === 'REVIEWED' ? '#fef3c7' : '' }}>
                  {viewingLog.status === 'REJECTED' ? 'DRAFT (REVISION)' : viewingLog.status}
                </span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Activities Logged:</strong>
                {viewingLog.activities}
              </div>

              {viewingLog.supervisor_comment && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
                  <strong style={{ color: '#6ee7b7', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Workplace Supervisor Feedback:</strong>
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

    </div>
  );
};

export default AcademicSupervisorDashboard;