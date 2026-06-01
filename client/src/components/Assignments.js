import React, { useState } from 'react';

const Assignments = ({ tasks, toggleTask, deleteTask }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const filteredTasks = tasksArray.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'All') return matchesSearch;
    if (filter === 'Completed') return matchesSearch && task.isCompleted;
    if (filter === 'Today') {
      const isToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
      return matchesSearch && isToday && !task.isCompleted;
    }
    return matchesSearch;
  });

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Med': return 'priority-med';
      case 'Low': return 'priority-low';
      default: return 'priority-med';
    }
  };

  return (
    <div className='page active'>
      <div style={{display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap'}}>
        {['All', 'Today', 'Upcoming', 'Completed'].map(f => (
          <button 
            key={f}
            className={'btn ' + (filter === f ? 'btn-primary' : '') + ' btn-sm'}
            onClick={() => setFilter(f)}
          >
            {f} {f === 'All' && <span className='nav-badge' style={{background: filter === 'All' ? 'rgba(255,255,255,0.25)' : 'var(--accent)'}}>{tasksArray.length}</span>}
          </button>
        ))}
        <input 
          className='input' 
          placeholder='Search assignments...' 
          style={{maxHeight:'32px', maxWidth:'260px', marginLeft:'auto', marginTop: '0'}}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className='task-list'>
        {filteredTasks.map(task => (
          <div key={task._id} className={'task-item ' + (task.isCompleted ? 'done' : '')}>
            <div 
              className={'task-check ' + (task.isCompleted ? 'checked' : '')}
              onClick={() => toggleTask && toggleTask(task._id, task.isCompleted)}
              style={{cursor:'pointer'}}
            >
              <svg viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg>
            </div>
            <span className='task-text'>{task.title}</span>
            <span className={'task-tag ' + getPriorityClass(task.priority)}>{task.priority || 'Med'}</span>
            <span className='task-due'>{formatDate(task.dueDate)}</span>
            <button 
              className='btn btn-sm' 
              style={{border:'none', background:'transparent', color:'var(--red)', padding:'4px', marginLeft:'8px', display:'flex', alignItems:'center', cursor:'pointer'}}
              onClick={() => deleteTask && deleteTask(task._id)}
            >
              <svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2'><polyline points='3 6 5 6 21 6'/><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/><line x1='10' y1='11' x2='10' y2='17'/><line x1='14' y1='11' x2='14' y2='17'/></svg>
            </button>
          </div>
        ))}
        {filteredTasks.length === 0 && <p style={{color:'var(--muted)', textAlign:'center', padding:'40px'}}>No assignments found.</p>}
      </div>
    </div>
  );
};

export default Assignments;