import React, { useState, useEffect } from 'react';

const Dashboard = ({ tasks, exams, user, refreshTrigger, toggleTask }) => {
  const [todayClasses, setTodayClasses] = useState([]);
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5001/api/timetable', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const classes = data.filter(c => c.day === currentDay);
          setTodayClasses(classes.sort((a, b) => a.timeIdx - b.timeIdx));
        }
      })
      .catch(err => console.error(err));
  }, [currentDay, refreshTrigger]);

  const times = ['09:00', '11:00', '13:00', '14:00', '16:00'];
  
  const getEndTime = (startTime) => {
    const hour = parseInt(startTime.split(':')[0], 10);
    return `${hour + 1}:00`;
  };

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const pendingTasks = tasksArray.filter(t => !t.isCompleted);
  
  const examsArray = Array.isArray(exams) ? exams : [];
  const upcomingExamsCount = examsArray.length;
  
  const getNextExamDays = () => {
    if (examsArray.length === 0) return null;
    const today = new Date();
    const sortedExams = [...examsArray].sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextExam = new Date(sortedExams[0].date);
    const diffTime = nextExam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nextExamDays = getNextExamDays();

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Med': return 'priority-med';
      case 'Low': return 'priority-low';
      default: return 'priority-med';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className='page active'>
      <div className='welcome-banner'>
        <div>
          <div className='welcome-title'>{getGreeting()}, {user?.name || 'Student'} 👋</div>
          <div className='welcome-sub'>You have {todayClasses.length} classes and {pendingTasks.length} assignments today.</div>
        </div>
        <div className='streak-badge'>
          <span className='streak-fire'>🔥</span>
          <div>
            <div className='streak-num'>{user?.streak || 0}</div>
            <div className='streak-label'>day streak</div>
          </div>
        </div>
      </div>

      <div className='stat-grid'>
        <div className='stat-card' style={{'--c':'var(--accent)', '--ic':'var(--accent-glow)'}}>
          <div className='stat-icon'><svg viewBox='0 0 24 24' fill='none' stroke='var(--accent)' strokeWidth='2.5'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg></div>
          <div className='stat-label'>Today's Classes</div>
          <div className='stat-value'>{todayClasses.length}</div>
          <div className='stat-sub'>All scheduled slots</div>
        </div>
        <div className='stat-card' style={{'--c':'var(--green)', '--ic':'var(--green-bg)'}}>
          <div className='stat-icon'><svg viewBox='0 0 24 24' fill='none' stroke='var(--green)' strokeWidth='2.5'><polyline points='20 6 9 17 4 12'/></svg></div>
          <div className='stat-label'>Assignments Done</div>
          <div className='stat-value'>{tasksArray.filter(t => t.isCompleted).length}<span style={{fontSize:'16px', color:'var(--muted)'}}>/{tasksArray.length}</span></div>
          <div className='stat-sub'>Keep pushing forward!</div>
        </div>
        <div className='stat-card' style={{'--c':'var(--amber)', '--ic':'var(--amber-bg)'}}>
          <div className='stat-icon'><svg viewBox='0 0 24 24' fill='none' stroke='var(--amber)' strokeWidth='2.5'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/></svg></div>
          <div className='stat-label'>Upcoming Exams</div>
          <div className='stat-value'>{upcomingExamsCount}</div>
          <div className='stat-sub'>{nextExamDays !== null ? `Next in ${nextExamDays} days` : 'No upcoming exams'}</div>
        </div>
      </div>

      <div className='two-col'>
        <div>
          <div className='section-header'>
            <div className='section-title'>Today's Schedule</div>
            <span className='section-link'>View all →</span>
          </div>
          <div id='today-schedule' style={{marginBottom:'24px'}}>
            {todayClasses.length > 0 ? todayClasses.map((c, i) => (
              <div key={i} className='schedule-row'>
                <div className='time-col'><span className='time-label'>{times[c.timeIdx]}</span></div>
                <div className='schedule-block' style={{'--c':'var(--accent)'}}>
                  <div className='block-subject'>{c.subject}</div>
                  <div className='block-meta'>{times[c.timeIdx]} – {getEndTime(times[c.timeIdx])} · {c.room || 'TBD'}</div>
                  <span className='block-badge badge-up'>Up next</span>
                </div>
              </div>
            )) : (
              <div className='schedule-row'>
                <div className='time-col'><span className='time-label'>--:--</span></div>
                <div className='schedule-block' style={{'--c':'var(--muted)'}}>
                  <div className='block-subject'>No classes today</div>
                  <div className='block-meta'>Enjoy your free time!</div>
                </div>
              </div>
            )}
          </div>

          <div className='section-header'>
            <div className='section-title'>Upcoming Exams</div>
            <span className='section-link'>View all →</span>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {examsArray.slice(0, 2).map((exam, i) => (
              <div key={exam._id || i} className='exam-card' style={{margin: 0}}>
                <div className='exam-info'>
                  <div className='exam-name' style={{fontSize:'14px'}}>{exam.name}</div>
                  <div className='exam-meta'>{new Date(exam.date).toLocaleDateString()} · {exam.subject}</div>
                </div>
                <div className='exam-badge' style={{marginLeft:'auto', padding:'4px 10px', background:'var(--accent-glow)', color:'var(--accent)', borderRadius:'20px', fontSize:'11px', fontWeight:'700'}}>
                  {Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24))} Days left
                </div>
              </div>
            ))}
            {examsArray.length === 0 && <p style={{color:'var(--muted)', fontSize:'13px'}}>No upcoming exams.</p>}
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
          <div className='card card-sm'>
            <div className='section-header'>
              <div className='section-title'>Pending Assignments</div>
              <span className='section-link'>All →</span>
            </div>
            <div className='task-list'>
              {pendingTasks.slice(0, 4).map(task => (
                <div key={task._id} className='task-item'>
                  <div className='task-check' onClick={() => toggleTask(task._id, task.isCompleted)}>
                    <svg viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg>
                  </div>
                  <span className='task-text'>{task.title}</span>
                  <span className={'task-tag ' + getPriorityClass(task.priority)}>{task.priority || 'Med'}</span>
                </div>
              ))}
              {pendingTasks.length === 0 && <p style={{color:'var(--muted)', fontSize:'13px', textAlign:'center'}}>No pending tasks!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;