import { createContext, useContext, useState, useEffect } from 'react';

const PrepContext = createContext();

export function usePrep() {
  return useContext(PrepContext);
}

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Get today's local date string YYYY-MM-DD
export const getTodayStr = () => {
    const d = new Date();
    // adjust to local timezone offset
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

export function PrepProvider({ children }) {
  // 1. Settings (Days of prep)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('prep_settings');
    return saved ? JSON.parse(saved) : { setupComplete: false, totalDays: 30, startDate: getTodayStr() };
  });

  // 2. Subjects and Topics
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('prep_subjects');
    return saved ? JSON.parse(saved) : []; 
    // Subject shape: { id, name, topics: [{ id, name, estimatedMinutes }] }
  });

  // 3. Schedule (Mapping 'Day X' to topics and allocated time)
  // shape: { dayIndex (0 based): [{ topicId, allocatedMinutes }] }
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('prep_schedule');
    return saved ? JSON.parse(saved) : {};
  });

  // 4. History (Tracking completions for streak calculation)
  // shape: { topicId: completionDateString }
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('prep_history');
    return saved ? JSON.parse(saved) : {};
  });

  // 5. Streaks 
  // shape: { "YYYY-MM-DD": true } for fully completed days
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('prep_completedDays');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('prep_settings', JSON.stringify(settings));
    localStorage.setItem('prep_subjects', JSON.stringify(subjects));
    localStorage.setItem('prep_schedule', JSON.stringify(schedule));
    localStorage.setItem('prep_history', JSON.stringify(history));
    localStorage.setItem('prep_completedDays', JSON.stringify(completedDays));
  }, [settings, subjects, schedule, history, completedDays]);

  // Actions
  const saveSettings = (totalDays) => {
    setSettings({ setupComplete: true, totalDays, startDate: getTodayStr() });
  };

  const addSubject = (name) => {
    setSubjects([...subjects, { id: generateId(), name, topics: [] }]);
  };

  const addTopic = (subjectId, name, estimatedMinutes) => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, topics: [...s.topics, { id: generateId(), name, estimatedMinutes }] };
      }
      return s;
    }));
  };

  const assignTopicToDay = (dayIndex, topicId, allocatedMinutes = 60) => {
    setSchedule(prev => {
      const dayTasks = prev[dayIndex] || [];
      // avoid duplicates
      if (dayTasks.find(t => t.topicId === topicId)) return prev;
      return { ...prev, [dayIndex]: [...dayTasks, { topicId, allocatedMinutes }] };
    });
  };

  const removeTopicFromDay = (dayIndex, topicId) => {
    setSchedule(prev => {
      const dayTasks = prev[dayIndex] || [];
      return { ...prev, [dayIndex]: dayTasks.filter(t => t.topicId !== topicId) };
    });
  };

  const markTopicComplete = (topicId) => {
    const today = getTodayStr();
    setHistory(prev => ({ ...prev, [topicId]: today }));
    
    // Check if all scheduled topics for today are completed
    // First figure out what day index today is relative to startDate
    const start = new Date(settings.startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const todaysSchedule = schedule[dayIndex] || [];
    // If we just completed a task, we need to check if all tasks in todaysSchedule are now in history
    // Since state closure contains old history, we build nextHistory:
    const nextHistory = { ...history, [topicId]: today };
    
    const allCompleted = todaysSchedule.every(t => nextHistory[t.topicId]);
    if (allCompleted && todaysSchedule.length > 0) {
      setCompletedDays(prev => ({ ...prev, [today]: true }));
    }
  };

  // Helper to get streak
  const currentStreak = () => {
    let streak = 0;
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    
    // if today is completed, streak starts at 1, else 0
    let checkDateStr = d.toISOString().split('T')[0];
    
    if (completedDays[checkDateStr]) {
       streak++;
    } else {
        // check yesterday
        d.setDate(d.getDate() - 1);
        checkDateStr = d.toISOString().split('T')[0];
        if (!completedDays[checkDateStr]) return 0; // neither today nor yesterday completed = 0 streak
    }

    // go backwards
    while (true) {
        d.setDate(d.getDate() - 1);
        const prevStr = d.toISOString().split('T')[0];
        if (completedDays[prevStr]) streak++;
        else break;
    }
    return streak;
  };

  const deleteSubject = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const topicIdsToRemove = subject.topics.map(t => t.id);

    // 1. Remove subject
    setSubjects(prev => prev.filter(s => s.id !== subjectId));

    // 2. Remove associated topics from schedule
    setSchedule(prev => {
      const nextSchedule = { ...prev };
      Object.keys(nextSchedule).forEach(day => {
        nextSchedule[day] = nextSchedule[day].filter(task => !topicIdsToRemove.includes(task.topicId));
      });
      return nextSchedule;
    });

    // 3. Optional: Remove from history
    setHistory(prev => {
      const nextHistory = { ...history };
      topicIdsToRemove.forEach(id => delete nextHistory[id]);
      return nextHistory;
    });
  };

  const deleteTopic = (subjectId, topicId) => {
    // 1. Remove topic from subject
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        return { ...s, topics: s.topics.filter(t => t.id !== topicId) };
      }
      return s;
    }));

    // 2. Remove from schedule
    setSchedule(prev => {
      const nextSchedule = { ...prev };
      Object.keys(nextSchedule).forEach(day => {
        nextSchedule[day] = nextSchedule[day].filter(task => task.topicId !== topicId);
      });
      return nextSchedule;
    });

    // 3. Remove from history
    setHistory(prev => {
      const nextHistory = { ...prev };
      delete nextHistory[topicId];
      return nextHistory;
    });
  };

  const value = {
    settings,
    saveSettings,
    subjects,
    addSubject,
    addTopic,
    deleteSubject,
    deleteTopic,
    schedule,
    assignTopicToDay,
    removeTopicFromDay,
    history,
    markTopicComplete,
    currentStreak: currentStreak(),
    completedDays
  };

  return <PrepContext.Provider value={value}>{children}</PrepContext.Provider>;
}
