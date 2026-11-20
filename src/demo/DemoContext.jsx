import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  INITIAL_INSTITUTE,
  INITIAL_STUDENTS,
  INITIAL_BATCHES,
  INITIAL_LECTURES,
  INITIAL_NOTICES,
  INITIAL_RESOURCES,
  INITIAL_ACTIVITY_LOG,
  ATTENDANCE_TREND_DATA
} from './mockData';

const DemoContext = createContext(null);

export const DemoProvider = ({ children }) => {
  // Current active demo persona
  const [currentRole, setCurrentRole] = useState('Admin'); // 'Admin' | 'Teacher' | 'Student'
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'batches' | 'schedule' | 'attendance' | 'notices' | 'resources' | 'analytics' | 'activity' | 'settings'
  
  // Interactive entities in state
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [lectures, setLectures] = useState(INITIAL_LECTURES);
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [activityLog, setActivityLog] = useState(INITIAL_ACTIVITY_LOG);
  
  // Selected detail states
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [activeAttendanceLectureId, setActiveAttendanceLectureId] = useState('lec-8'); // Default to In-Progress lecture
  const [inspectStudent, setInspectStudent] = useState(null);
  const [callParentTarget, setCallParentTarget] = useState(null);
  const [reportPreviewStudent, setReportPreviewStudent] = useState(null);

  // Notifications state for bell dropdown
  const [notifications, setNotifications] = useState([
    { id: "notif-1", title: "New mock paper date announced", time: "10 mins ago", read: false },
    { id: "notif-2", title: "Low attendance warning: Aarav Sharma", time: "1 hour ago", read: false },
    { id: "notif-3", title: "Physics lecture scheduled for 02:00 PM", time: "2 hours ago", read: true }
  ]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper: Append to Activity Log
  const logActivity = ({ action, category, details, batchName }) => {
    const actorRole = currentRole;
    const actorName = currentRole === 'Admin' ? 'Siddharth Nair' : currentRole === 'Teacher' ? 'Prof. Arvind Ramanathan' : 'Aarav Sharma';
    const newEntry = {
      id: `act-${Date.now()}`,
      action,
      category,
      actorRole,
      actorName,
      batchName: batchName || 'General',
      details,
      timestamp: 'Just now'
    };
    setActivityLog(prev => [newEntry, ...prev]);
  };

  // Action: Log Parent Call
  const recordParentCall = ({ studentId, studentName, parentName, notes }) => {
    logActivity({
      action: "Parent Call Logged",
      category: "Parent Calls",
      batchName: students.find(s => s.id === studentId)?.batchName || "Cohort",
      details: `Called ${parentName} regarding ${studentName}. Notes: "${notes || 'No remarks provided'}"`
    });
    showToast(`Call logged for ${studentName}'s parent in Activity Log`);
    setCallParentTarget(null);
  };

  // Action: Save Attendance for a Lecture
  const saveAttendanceSession = ({ lectureId, studentRosterStatuses }) => {
    // studentRosterStatuses: { [studentId]: 'Present' | 'Absent' | 'Late' }
    const lecture = lectures.find(l => l.id === lectureId);
    if (!lecture) return;

    let present = 0;
    let absent = 0;
    let late = 0;

    Object.values(studentRosterStatuses).forEach(status => {
      if (status === 'Present') present++;
      if (status === 'Absent') absent++;
      if (status === 'Late') late++;
    });

    // Update lecture
    setLectures(prev => prev.map(l => {
      if (l.id === lectureId) {
        return {
          ...l,
          status: 'Finished',
          attendanceMarked: true,
          presentCount: present,
          absentCount: absent,
          lateCount: late
        };
      }
      return l;
    }));

    // Update students attendance history & overall %
    setStudents(prevStudents => prevStudents.map(stu => {
      const newStatus = studentRosterStatuses[stu.id];
      if (!newStatus) return stu;

      const existingHistory = stu.attendanceHistory || [];
      const updatedHistory = [
        {
          lectureId: lecture.id,
          subject: lecture.subject,
          topic: lecture.topic,
          date: "20 Nov 2026",
          status: newStatus
        },
        ...existingHistory.filter(h => h.lectureId !== lecture.id)
      ];

      const presentTotal = updatedHistory.filter(h => h.status === 'Present').length;
      const computedRate = Math.round((presentTotal / updatedHistory.length) * 1000) / 10;

      return {
        ...stu,
        attendanceRate: computedRate,
        attendanceHistory: updatedHistory
      };
    }));

    logActivity({
      action: "Attendance Recorded",
      category: "Attendance",
      batchName: lecture.batchName,
      details: `Saved attendance for ${lecture.topic}: ${present} Present, ${absent} Absent, ${late} Late.`
    });

    showToast(`Attendance saved for ${lecture.batchName}`);
  };

  // Action: Publish Notice
  const publishNotice = ({ title, batchId, content, urgent }) => {
    const targetBatch = batchId === 'all' ? 'All Batches' : batches.find(b => b.id === batchId)?.name || 'General';
    const newNotice = {
      id: `not-${Date.now()}`,
      title,
      batchId,
      batchName: targetBatch,
      author: currentRole === 'Admin' ? 'Admin Academic Cell' : 'Prof. Arvind Ramanathan',
      date: 'Just now',
      urgent: Boolean(urgent),
      content
    };

    setNotices(prev => [newNotice, ...prev]);

    // Add to notifications
    setNotifications(prev => [
      { id: `notif-${Date.now()}`, title: `New Notice: ${title}`, time: 'Just now', read: false },
      ...prev
    ]);

    logActivity({
      action: "Notice Published",
      category: "Notices",
      batchName: targetBatch,
      details: `Published "${title}" for ${targetBatch}`
    });

    showToast("Notice successfully published");
  };

  // Action: Upload Resource
  const uploadResource = ({ title, batchId, category, size }) => {
    const targetBatch = batches.find(b => b.id === batchId)?.name || 'All Batches';
    const newRes = {
      id: `res-${Date.now()}`,
      title: title.endsWith('.pdf') ? title : `${title}.pdf`,
      batchId,
      batchName: targetBatch,
      category: category || 'Study Notes',
      size: size || '3.5 MB',
      uploadedBy: currentRole === 'Admin' ? 'Admin Cell' : 'Prof. Arvind Ramanathan',
      date: 'Just now',
      downloadUrl: '#'
    };

    setResources(prev => [newRes, ...prev]);

    logActivity({
      action: "Resource Uploaded",
      category: "Resources",
      batchName: targetBatch,
      details: `Uploaded ${newRes.title} (${newRes.category})`
    });

    showToast(`Resource "${newRes.title}" uploaded`);
  };

  // Action: Schedule Lecture
  const scheduleLecture = ({ batchId, subject, topic, date, time, room, teacherName }) => {
    const batch = batches.find(b => b.id === batchId);
    const newLecture = {
      id: `lec-${Date.now()}`,
      batchId,
      batchName: batch?.name || 'JEE 2027',
      subject: subject || batch?.subject || 'Mathematics',
      topic,
      teacherId: batch?.teacherId || 'tch-1',
      teacherName: teacherName || batch?.teacherName || 'Faculty',
      room: room || 'Room 101',
      date: date || '2026-11-21',
      time: time || '10:00 AM - 12:00 PM',
      status: 'Scheduled',
      attendanceMarked: false,
      totalEnrolled: batch?.studentCount || 35,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0
    };

    setLectures(prev => [newLecture, ...prev]);

    logActivity({
      action: "Lecture Scheduled",
      category: "Lectures",
      batchName: newLecture.batchName,
      details: `Scheduled ${newLecture.subject} (${newLecture.topic}) for ${newLecture.date} at ${newLecture.time}`
    });

    showToast("New lecture session scheduled");
  };

  // Action: Start Lecture
  const startLecture = (lectureId) => {
    setLectures(prev => prev.map(l => {
      if (l.id === lectureId) {
        return { ...l, status: 'In Progress' };
      }
      return l;
    }));
    setActiveAttendanceLectureId(lectureId);
    setCurrentView('attendance');
    showToast("Lecture started. Opened Attendance Session.");
  };

  // Current persona metadata
  const currentPersona = useMemo(() => {
    if (currentRole === 'Admin') {
      return {
        name: "Siddharth Nair",
        role: "Head of Operations",
        email: "siddharth@eskolaria.edu",
        avatarText: "SN"
      };
    }
    if (currentRole === 'Teacher') {
      return {
        name: "Prof. Arvind Ramanathan",
        role: "Senior Math Faculty",
        email: "arvind.r@eskolaria.edu",
        avatarText: "AR",
        assignedBatchIds: ["batch-1"]
      };
    }
    return {
      name: "Aarav Sharma",
      role: "Student (Roll: EA-2027-01)",
      email: "aarav.sharma@gmail.com",
      avatarText: "AS",
      studentId: "stu-101",
      batchId: "batch-1",
      batchName: "JEE 2027 - Batch A"
    };
  }, [currentRole]);

  // Context value bundle
  const value = {
    institute: INITIAL_INSTITUTE,
    currentRole,
    setCurrentRole,
    currentView,
    setCurrentView,
    currentPersona,
    
    // Entities
    students,
    batches,
    lectures,
    notices,
    resources,
    activityLog,
    attendanceTrend: ATTENDANCE_TREND_DATA,

    // Selections
    selectedBatchId,
    setSelectedBatchId,
    activeAttendanceLectureId,
    setActiveAttendanceLectureId,
    inspectStudent,
    setInspectStudent,
    callParentTarget,
    setCallParentTarget,
    reportPreviewStudent,
    setReportPreviewStudent,

    // Notifications & Toast
    notifications,
    setNotifications,
    toastMessage,
    showToast,

    // Dispatchers
    recordParentCall,
    saveAttendanceSession,
    publishNotice,
    uploadResource,
    scheduleLecture,
    startLecture
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
