import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, Trash2, Clock, Pill, Check, AlertCircle, Zap } from 'lucide-react';
import { Button } from './common/Button';
import { addNotification } from '../utils/notifications';

interface Medicine {
  id: string;
  name: string;
}

interface Alarm {
  id: string;
  time: string;
  medicines: Medicine[];
  isActive: boolean;
}

interface Log {
  id: string;
  alarmId: string;
  medicines: string[];
  takenAt: string;
  notes?: string;
}

export const MedicineAlarm: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem('medcore_alarms');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [logs, setLogs] = useState<Log[]>(() => {
    const saved = localStorage.getItem('medcore_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newMedicines, setNewMedicines] = useState<string[]>(['']);
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // State for active alarm interaction
  const [takenMedicines, setTakenMedicines] = useState<string[]>([]);
  
  // Background Keep-Alive State
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const [silentAudio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')); // Using the same sound for now, but volume 0

  useEffect(() => {
    localStorage.setItem('medcore_alarms', JSON.stringify(alarms));
    // Whenever alarms change, try to schedule native notifications if in a wrapper
    alarms.forEach(scheduleNativeNotification);
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('medcore_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermissionGranted(true);
    }
    
    // Check if we are already in a native wrapper
    if ((window as any).Capacitor || (window as any).cordova) {
      setIsBackgroundMode(true);
    }
  }, []);

  // Reset interaction state when active alarm changes
  useEffect(() => {
    if (activeAlarm) {
      setTakenMedicines(activeAlarm.medicines.map(m => m.id));
    }
  }, [activeAlarm]);

  // NATIVE WRAPPER COMPATIBILITY
  // This function is designed to work if you wrap this web app with Capacitor or Cordova
  const scheduleNativeNotification = (alarm: Alarm) => {
    if (!alarm.isActive) return;

    const [hours, minutes] = alarm.time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Capacitor / Cordova Local Notifications Logic
    // If you build this as a native app, this code block will execute
    if ((window as any).Capacitor?.Plugins?.LocalNotifications) {
      (window as any).Capacitor.Plugins.LocalNotifications.schedule({
        notifications: [{
          title: "Time for Meds!",
          body: `Take: ${alarm.medicines.map(m => m.name).join(', ')}`,
          id: parseInt(alarm.id.replace(/\D/g, '').slice(0, 8)) || Math.floor(Math.random() * 100000),
          schedule: { at: scheduledTime, repeats: true, every: 'day' },
          sound: 'beep.wav',
          actionTypeId: "",
          extra: null
        }]
      }).catch(console.error);
    }
  };

  const enableBackgroundMode = () => {
    // "Hack" for Web: Play silent audio to keep the browser tab active in background
    silentAudio.volume = 0.01; // Not perfectly silent, but keeps thread alive
    silentAudio.loop = true;
    silentAudio.play().then(() => {
      setIsBackgroundMode(true);
      // Also request notification permission if not already
      requestPermissions();
    }).catch(console.error);
  };

  const requestPermissions = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPermissionGranted(true);
        // Test sound to unlock audio context
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(console.error);
      }
    }
    
    // Request Native Permissions if available
    if ((window as any).Capacitor?.Plugins?.LocalNotifications) {
      (window as any).Capacitor.Plugins.LocalNotifications.requestPermissions();
    }
  };

  // Track last triggered time to prevent re-triggering within the same minute
  const [lastTriggeredTime, setLastTriggeredTime] = useState<Record<string, string>>({});

  // Check for alarms every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      alarms.forEach(alarm => {
        if (alarm.isActive && alarm.time === currentTime) {
          // Prevent multiple triggers if already active or if already triggered this minute
          if (lastTriggeredTime[alarm.id] === currentTime) return;
          
          setActiveAlarm(prev => {
            if (prev?.id === alarm.id) return prev;
            
            // Mark as triggered for this minute
            setLastTriggeredTime(prev => ({ ...prev, [alarm.id]: currentTime }));
            
            playAlarmSound(alarm);
            return alarm;
          });
        }
      });
    }, 1000); // Check every second for better precision, but logic handles minute matching

    return () => clearInterval(interval);
  }, [alarms, lastTriggeredTime]);

  const playAlarmSound = (alarm: Alarm) => {
    audio.loop = true;
    audio.play().catch(e => console.log('Audio play failed:', e));

    if (Notification.permission === "granted") {
      new Notification("Time for Meds!", {
        body: `It's ${alarm.time}. Take: ${alarm.medicines.map(m => m.name).join(', ')}`,
        requireInteraction: true,
      });
    }
  };

  const stopAlarm = () => {
    if (activeAlarm) {
      const takenNames = activeAlarm.medicines
        .filter(m => takenMedicines.includes(m.id))
        .map(m => m.name);
        
      if (takenNames.length > 0) {
        const newLog: Log = {
          id: Date.now().toString(),
          alarmId: activeAlarm.id,
          medicines: takenNames,
          takenAt: new Date().toLocaleString()
        };
        setLogs(prev => [newLog, ...prev]);
      }
    }
    
    // Ensure audio is properly stopped
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {
      console.error('Error stopping audio:', e);
    }
    
    // Clear active alarm to close the modal
    setActiveAlarm(null);
  };

  const toggleTakenMedicine = (medId: string) => {
    setTakenMedicines(prev => 
      prev.includes(medId) 
        ? prev.filter(id => id !== medId)
        : [...prev, medId]
    );
  };

  const testAlarm = () => {
    const mockAlarm: Alarm = {
      id: 'test',
      time: 'Test',
      medicines: [{ id: '1', name: 'Test Medicine' }, { id: '2', name: 'Vitamin C' }],
      isActive: true
    };
    setActiveAlarm(mockAlarm);
    playAlarmSound(mockAlarm);
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all recent activity?')) {
      setLogs([]);
    }
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleAddAlarm = () => {
    if (!newTime) return;
    
    const validMedicines = newMedicines.filter(m => m.trim() !== '').map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim()
    }));

    if (validMedicines.length === 0) return;

    const newAlarm: Alarm = {
      id: Math.random().toString(36).substr(2, 9),
      time: newTime,
      medicines: validMedicines,
      isActive: true
    };

    setAlarms([...alarms, newAlarm]);
    setShowAddModal(false);
    setNewTime('');
    setNewMedicines(['']);
    
    addNotification({
      topic: 'pharmacyDeals',
      title: 'New Medicine Alarm Set',
      message: `Alarm scheduled for ${newTime} for ${validMedicines.map(m => m.name).join(', ')}.`,
      iconType: 'alarm',
      color: 'bg-indigo-100 text-indigo-600'
    });
    
    // Request permissions if not granted yet when adding first alarm
    if (!permissionGranted) {
      requestPermissions();
    }
  };

  const addMedicineField = () => {
    setNewMedicines([...newMedicines, '']);
  };

  const updateMedicineField = (index: number, value: string) => {
    const updated = [...newMedicines];
    updated[index] = value;
    setNewMedicines(updated);
  };

  const removeMedicineField = (index: number) => {
    const updated = newMedicines.filter((_, i) => i !== index);
    setNewMedicines(updated);
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold uppercase tracking-wider">
          <Bell className="w-4 h-4" />
          Medicine Reminders
        </div>
        <h2 className="text-4xl font-black text-slate-900">Never Miss a Dose</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Set daily alarms for your medications. We'll remind you exactly when it's time to take them.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-xl mx-auto flex gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Using in Browser / PWA?</p>
            <p>
              Enable <span className="font-bold">"Background Mode"</span> above to prevent your phone from pausing the alarm when the screen is off.
            </p>

            {isBackgroundMode && (
              <div className="mt-2 text-green-600 font-bold flex items-center gap-1 bg-white/50 p-2 rounded-lg w-fit">
                <Check className="w-4 h-4" /> Background Mode is Active
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 flex-wrap">
        <Button 
          onClick={enableBackgroundMode}
          disabled={isBackgroundMode}
          className={`rounded-xl px-6 py-3 font-bold flex items-center gap-2 transition-all ${
            isBackgroundMode 
              ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          {isBackgroundMode ? (
            <>
              <Check className="w-5 h-5" />
              Background Active
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Enable Background
            </>
          )}
        </Button>
        <Button 
          onClick={testAlarm}
          className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl px-6 py-3 font-bold"
        >
          Test Alarm
        </Button>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New Alarm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {alarms.map((alarm) => (
            <motion.div
              key={alarm.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-6 rounded-3xl border-2 transition-all ${
                alarm.isActive 
                  ? 'bg-white border-indigo-100 shadow-xl shadow-indigo-500/5' 
                  : 'bg-slate-50 border-slate-100 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${alarm.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-3xl font-black ${alarm.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                      {alarm.time}
                    </h3>
                    <p className={`text-sm font-medium ${alarm.isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                      Daily Reminder
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      alarm.isActive ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      alarm.isActive ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                  <button 
                    onClick={() => deleteAlarm(alarm.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {alarm.medicines.map((med) => (
                  <div key={med.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Pill className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-medium">{med.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {alarms.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No alarms set</h3>
            <p className="text-slate-500">Add your first medicine reminder to get started.</p>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
            <button 
              onClick={clearLogs}
              className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-xl self-start">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{log.medicines.join(', ')}</p>
                    <p className="text-xs text-slate-500 mb-1">Taken at {log.takenAt}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteLog(log.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Alarm Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Add Reminder</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-2xl font-bold text-center text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Medicines</label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {newMedicines.map((med, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={med}
                          onChange={(e) => updateMedicineField(index, e.target.value)}
                          placeholder="Medicine name (e.g. Napa)"
                          className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 outline-none text-slate-900 dark:text-white"
                        />
                        {newMedicines.length > 1 && (
                          <button 
                            onClick={() => removeMedicineField(index)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addMedicineField}
                    className="mt-3 text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add another medicine
                  </button>
                </div>

                <Button 
                  onClick={handleAddAlarm}
                  disabled={!newTime || newMedicines.every(m => !m.trim())}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Reminder
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Active Alarm Alert */}
      <AnimatePresence>
        {activeAlarm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Bell className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">Time for Meds!</h3>
                <p className="text-slate-500 mb-8 text-lg">It's {activeAlarm.time}. Please take your scheduled medicines.</p>
                
                <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-left space-y-3 max-h-48 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select medicines taken:</p>
                  {activeAlarm.medicines.map((med) => (
                    <div 
                      key={med.id} 
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors"
                      onClick={() => toggleTakenMedicine(med.id)}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        takenMedicines.includes(med.id) 
                          ? 'bg-indigo-500 border-indigo-500' 
                          : 'border-slate-300'
                      }`}>
                        {takenMedicines.includes(med.id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-lg font-bold transition-colors ${
                        takenMedicines.includes(med.id) ? 'text-slate-900' : 'text-slate-400'
                      }`}>{med.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      audio.pause();
                      audio.currentTime = 0;
                      setActiveAlarm(null);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl py-4 text-lg font-bold"
                  >
                    Snooze
                  </Button>
                  <Button 
                    onClick={stopAlarm}
                    disabled={takenMedicines.length === 0}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 text-lg font-bold shadow-xl shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Taken
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
