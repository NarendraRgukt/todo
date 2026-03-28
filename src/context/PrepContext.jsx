import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import defaultSubjects from '../data/defaultSubjects.json';
import defaultSchedule from '../data/defaultSchedule.json';

const PrepContext = createContext();

export function usePrep() {
  return useContext(PrepContext);
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const getTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const getDefaultSubjects = () => defaultSubjects.map(s => ({
  ...s,
  id: generateId(),
  topics: s.topics.map(t => ({ ...t, id: generateId() }))
}));

export function PrepProvider({ children }) {
  // --- New Multi-Plan State ---
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('prep_multi_plans');
    if (saved) return JSON.parse(saved);

    // Migration Logic: Check for legacy single-plan data
    const legacySettings = localStorage.getItem('prep_settings');
    if (legacySettings) {
      const mainPlan = {
        id: 'main-plan',
        name: 'Main Plan',
        settings: JSON.parse(legacySettings),
        subjects: JSON.parse(localStorage.getItem('prep_subjects') || '[]'),
        schedule: JSON.parse(localStorage.getItem('prep_schedule') || '{}'),
        history: JSON.parse(localStorage.getItem('prep_history') || '{}'),
        completedDays: JSON.parse(localStorage.getItem('prep_completedDays') || '{}')
      };
      
      // Clear legacy data once migrated
      localStorage.removeItem('prep_settings');
      localStorage.removeItem('prep_subjects');
      localStorage.removeItem('prep_schedule');
      localStorage.removeItem('prep_history');
      localStorage.removeItem('prep_completedDays');
      
      return [mainPlan];
    }

    // Default first plan for new users
    const initialSubjects = getDefaultSubjects();
    const initialSchedule = {};

    // Map default schedule topics (by name) to the newly generated IDs
    defaultSchedule.forEach(item => {
      // Find the topic object across all subjects
      for (const sub of initialSubjects) {
        const topic = sub.topics.find(t => t.name === item.topicName);
        if (topic) {
          if (!initialSchedule[item.day]) initialSchedule[item.day] = [];
          initialSchedule[item.day].push({ topicId: topic.id, allocatedMinutes: item.minutes });
          break;
        }
      }
    });

    return [{
      id: generateId(),
      name: 'My Exam Plan',
      settings: { setupComplete: false, totalDays: 100, startDate: getTodayStr() },
      subjects: initialSubjects,
      schedule: initialSchedule,
      history: {},
      completedDays: {}
    }];
  });

  const [activePlanId, setActivePlanId] = useState(() => {
    return localStorage.getItem('prep_activePlanId') || (plans.length > 0 ? plans[0].id : null);
  });

  // Derived active plan data
  const activePlan = useMemo(() => {
    return plans.find(p => p.id === activePlanId) || plans[0];
  }, [plans, activePlanId]);

  // Individual states synced to active plan for component compatibility
  const [settings, setSettings] = useState(activePlan.settings);
  const [subjects, setSubjects] = useState(activePlan.subjects);
  const [schedule, setSchedule] = useState(activePlan.schedule);
  const [history, setHistory] = useState(activePlan.history);
  const [completedDays, setCompletedDays] = useState(activePlan.completedDays);

  // Update individual states when switching plans
  useEffect(() => {
    if (activePlan) {
      setSettings(activePlan.settings);
      setSubjects(activePlan.subjects);
      setSchedule(activePlan.schedule);
      setHistory(activePlan.history);
      setCompletedDays(activePlan.completedDays);
      localStorage.setItem('prep_activePlanId', activePlanId);
    }
  }, [activePlanId]);

  // Persist all plans to localStorage whenever ANY active data changes
  useEffect(() => {
    const updatedPlans = plans.map(p => {
      if (p.id === activePlanId) {
        return { ...p, settings, subjects, schedule, history, completedDays };
      }
      return p;
    });
    
    // Only update if something actually changed to avoid infinite loops
    const hasChanged = JSON.stringify(updatedPlans) !== JSON.stringify(plans);
    if (hasChanged) {
      setPlans(updatedPlans);
      localStorage.setItem('prep_multi_plans', JSON.stringify(updatedPlans));
    }
  }, [settings, subjects, schedule, history, completedDays, activePlanId]);

  // --- Actions ---

  const createPlan = (name, totalDays) => {
    const newSubjects = getDefaultSubjects();
    const newSchedule = {};

    // Map default schedule topics (by name) to the newly generated IDs
    defaultSchedule.forEach(item => {
      // We only include schedule items for days within the totalDays limit
      if (item.day < totalDays) {
        for (const sub of newSubjects) {
          const topic = sub.topics.find(t => t.name === item.topicName);
          if (topic) {
            if (!newSchedule[item.day]) newSchedule[item.day] = [];
            newSchedule[item.day].push({ topicId: topic.id, allocatedMinutes: item.minutes });
            break;
          }
        }
      }
    });

    const newPlan = {
      id: generateId(),
      name,
      settings: { setupComplete: true, totalDays, startDate: getTodayStr() },
      subjects: newSubjects,
      schedule: newSchedule,
      history: {},
      completedDays: {}
    };
    const nextPlans = [...plans, newPlan];
    setPlans(nextPlans);
    setActivePlanId(newPlan.id);
  };

  const switchPlan = (planId) => {
    setActivePlanId(planId);
  };

  const deletePlan = (planId) => {
    if (plans.length <= 1) return; // Must have at least one plan
    const updatedPlans = plans.filter(p => p.id !== planId);
    setPlans(updatedPlans);
    if (activePlanId === planId) {
      setActivePlanId(updatedPlans[0].id);
    }
    localStorage.setItem('prep_multi_plans', JSON.stringify(updatedPlans));
  };

  const renameActivePlan = (newName) => {
    setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, name: newName } : p));
  };

  const saveSettings = (totalDays) => {
    setSettings({ ...settings, setupComplete: true, totalDays, startDate: getTodayStr() });
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
    
    const start = new Date(settings.startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const todaysSchedule = schedule[dayIndex] || [];
    const nextHistory = { ...history, [topicId]: today };
    
    const allCompleted = todaysSchedule.every(t => nextHistory[t.topicId]);
    if (allCompleted && todaysSchedule.length > 0) {
      setCompletedDays(prev => ({ ...prev, [today]: true }));
    }
  };

  const currentStreak = () => {
    let streak = 0;
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    
    let checkDateStr = d.toISOString().split('T')[0];
    
    if (completedDays[checkDateStr]) {
       streak++;
    } else {
        d.setDate(d.getDate() - 1);
        checkDateStr = d.toISOString().split('T')[0];
        if (!completedDays[checkDateStr]) return 0;
    }

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
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setSchedule(prev => {
      const nextSchedule = { ...prev };
      Object.keys(nextSchedule).forEach(day => {
        nextSchedule[day] = nextSchedule[day].filter(task => !topicIdsToRemove.includes(task.topicId));
      });
      return nextSchedule;
    });
    setHistory(prev => {
      const nextHistory = { ...prev };
      topicIdsToRemove.forEach(id => delete nextHistory[id]);
      return nextHistory;
    });
  };

  const deleteTopic = (subjectId, topicId) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        return { ...s, topics: s.topics.filter(t => t.id !== topicId) };
      }
      return s;
    }));
    setSchedule(prev => {
      const nextSchedule = { ...prev };
      Object.keys(nextSchedule).forEach(day => {
        nextSchedule[day] = nextSchedule[day].filter(task => task.topicId !== topicId);
      });
      return nextSchedule;
    });
    setHistory(prev => {
      const nextHistory = { ...prev };
      delete nextHistory[topicId];
      return nextHistory;
    });
  };

  const resetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const value = {
    plans,
    activePlanId,
    activePlan,
    createPlan,
    switchPlan,
    deletePlan,
    renameActivePlan,
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
    completedDays,
    resetData
  };

  return <PrepContext.Provider value={value}>{children}</PrepContext.Provider>;
}
