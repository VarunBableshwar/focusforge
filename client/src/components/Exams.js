import React from 'react';

const Exams = ({ exams }) => {
  const examsArray = Array.isArray(exams) ? exams : [];

  const calculateDaysRemaining = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Derived subjects from exams for syllabus coverage
  const subjects = Array.from(new Set(examsArray.map(e => e.subject))).map(subName => {
    const subExams = examsArray.filter(e => e.subject === subName);
    const avgProgress = subExams.reduce((acc, curr) => acc + (curr.progress || 0), 0) / subExams.length;
    return {
      name: subName,
      color: subExams[0]?.color || '#7c3aed',
      coverage: Math.round(avgProgress)
    };
  });

  return (
    <div className='page active'>
      <div className='two-col'>
        <div>
          <div className='section-header'><div className='section-title'>Upcoming Exams</div></div>
          {examsArray.map((exam, i) => {
            const daysRemaining = calculateDaysRemaining(exam.date);
            return (
              <div key={exam._id || i} className='exam-card'>
                <div className='exam-countdown' style={{background: (exam.color || '#7c3aed') + '1a'}}>
                  <span className='exam-days' style={{color: exam.color || '#7c3aed'}}>{String(daysRemaining).padStart(2, '0')}</span>
                  <span className='exam-d' style={{color: exam.color || '#7c3aed'}}>DAYS</span>
                </div>
                <div className='exam-info'>
                  <div className='exam-name'>{exam.name}</div>
                  <div className='exam-meta'>{formatDate(exam.date)} · {exam.subject}</div>
                  <div className='exam-progress'>
                    <div className='exam-progress-bar' style={{width: (exam.progress || 0) + '%', background: exam.color || '#7c3aed'}}></div>
                  </div>
                </div>
              </div>
            );
          })}
          {examsArray.length === 0 && <p style={{color:'var(--muted)', textAlign:'center', padding:'40px'}}>No upcoming exams scheduled.</p>}
        </div>
        <div className='card card-sm'>
          <div className='section-title' style={{marginBottom:'16px'}}>Syllabus Coverage</div>
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            {subjects.length > 0 ? subjects.map((sub, i) => (
              <div key={i}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
                  <span style={{fontSize:'13px', fontWeight:'600'}}>{sub.name}</span>
                  <span style={{fontSize:'12px', fontWeight:'700', color: sub.color}}>{sub.coverage}%</span>
                </div>
                <div style={{height:'6px', background:'var(--bg)', borderRadius:'6px', overflow:'hidden'}}>
                  <div style={{height:'100%', width: sub.coverage + '%', background: sub.color, borderRadius:'6px'}}></div>
                </div>
              </div>
            )) : <p style={{color:'var(--muted)', fontSize:'13px'}}>Add exams to track coverage.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;