// Initial realistic mock data for Eskolaria Academy

export const INITIAL_INSTITUTE = {
  name: "Eskolaria Academy",
  location: "Bandra West, Mumbai",
  academicYear: "2026-2027",
  principal: "Dr. Vikramaditya Sen",
  contact: "+91 22 2640 1890",
  email: "academics@eskolaria.edu"
};

export const INITIAL_STUDENTS = [
  {
    id: "stu-101",
    name: "Aarav Sharma",
    rollNo: "EA-2027-01",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    email: "aarav.sharma@gmail.com",
    phone: "+91 98201 44521",
    parentName: "Rajesh Sharma",
    parentPhone: "+91 98201 99882",
    parentRelation: "Father",
    attendanceRate: 68.2, // Below 75%
    status: "Active",
    joinDate: "12 June 2025",
    remarks: "Needs attention in Integral Calculus. Missed 3 consecutive sessions in Physics.",
    attendanceHistory: [
      { lectureId: "lec-1", subject: "Mathematics", topic: "Complex Numbers - De Moivre's", date: "20 Nov 2026", status: "Absent" },
      { lectureId: "lec-2", subject: "Physics", topic: "Electromagnetic Induction - Lenz Law", date: "19 Nov 2026", status: "Absent" },
      { lectureId: "lec-3", subject: "Chemistry", topic: "Thermodynamics - Enthalpy", date: "18 Nov 2026", status: "Absent" },
      { lectureId: "lec-4", subject: "Mathematics", topic: "Matrices & Determinants", date: "17 Nov 2026", status: "Present" },
      { lectureId: "lec-5", subject: "Physics", topic: "Wave Optics - Interference", date: "16 Nov 2026", status: "Present" }
    ]
  },
  {
    id: "stu-102",
    name: "Diya Patel",
    rollNo: "EA-2027-02",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    email: "diya.patel@gmail.com",
    phone: "+91 98192 33412",
    parentName: "Sanjay Patel",
    parentPhone: "+91 98192 11002",
    parentRelation: "Father",
    attendanceRate: 94.5,
    status: "Active",
    joinDate: "10 June 2025",
    remarks: "Top performer in Mathematics test series. Consistent attendance.",
    attendanceHistory: [
      { lectureId: "lec-1", subject: "Mathematics", topic: "Complex Numbers - De Moivre's", date: "20 Nov 2026", status: "Present" },
      { lectureId: "lec-2", subject: "Physics", topic: "Electromagnetic Induction - Lenz Law", date: "19 Nov 2026", status: "Present" },
      { lectureId: "lec-3", subject: "Chemistry", topic: "Thermodynamics - Enthalpy", date: "18 Nov 2026", status: "Present" },
      { lectureId: "lec-4", subject: "Mathematics", topic: "Matrices & Determinants", date: "17 Nov 2026", status: "Present" },
      { lectureId: "lec-5", subject: "Physics", topic: "Wave Optics - Interference", date: "16 Nov 2026", status: "Present" }
    ]
  },
  {
    id: "stu-103",
    name: "Rohan Verma",
    rollNo: "EA-2027-03",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    email: "rohan.verma@outlook.com",
    phone: "+91 99304 88210",
    parentName: "Meenakshi Verma",
    parentPhone: "+91 99304 77123",
    parentRelation: "Mother",
    attendanceRate: 71.0, // Below 75%
    status: "Active",
    joinDate: "14 June 2025",
    remarks: "Late entry in morning batches due to transit. Parent advised.",
    attendanceHistory: [
      { lectureId: "lec-1", subject: "Mathematics", topic: "Complex Numbers - De Moivre's", date: "20 Nov 2026", status: "Late" },
      { lectureId: "lec-2", subject: "Physics", topic: "Electromagnetic Induction - Lenz Law", date: "19 Nov 2026", status: "Absent" },
      { lectureId: "lec-3", subject: "Chemistry", topic: "Thermodynamics - Enthalpy", date: "18 Nov 2026", status: "Present" },
      { lectureId: "lec-4", subject: "Mathematics", topic: "Matrices & Determinants", date: "17 Nov 2026", status: "Present" },
      { lectureId: "lec-5", subject: "Physics", topic: "Wave Optics - Interference", date: "16 Nov 2026", status: "Absent" }
    ]
  },
  {
    id: "stu-104",
    name: "Ananya Iyer",
    rollNo: "EA-2027-04",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    email: "ananya.iyer@gmail.com",
    phone: "+91 98210 55678",
    parentName: "K. R. Iyer",
    parentPhone: "+91 98210 99443",
    parentRelation: "Father",
    attendanceRate: 91.0,
    status: "Active",
    joinDate: "11 June 2025",
    remarks: "Strong conceptual grip on Organic Reaction Mechanisms.",
    attendanceHistory: [
      { lectureId: "lec-1", subject: "Mathematics", topic: "Complex Numbers - De Moivre's", date: "20 Nov 2026", status: "Present" },
      { lectureId: "lec-2", subject: "Physics", topic: "Electromagnetic Induction - Lenz Law", date: "19 Nov 2026", status: "Present" },
      { lectureId: "lec-3", subject: "Chemistry", topic: "Thermodynamics - Enthalpy", date: "18 Nov 2026", status: "Present" },
      { lectureId: "lec-4", subject: "Mathematics", topic: "Matrices & Determinants", date: "17 Nov 2026", status: "Present" },
      { lectureId: "lec-5", subject: "Physics", topic: "Wave Optics - Interference", date: "16 Nov 2026", status: "Late" }
    ]
  },
  {
    id: "stu-105",
    name: "Kabir Sengupta",
    rollNo: "EA-2027-05",
    batchId: "batch-2",
    batchName: "JEE 2027 - Batch B",
    email: "kabir.sen@gmail.com",
    phone: "+91 98330 11223",
    parentName: "Debashis Sengupta",
    parentPhone: "+91 98330 99112",
    parentRelation: "Father",
    attendanceRate: 88.0,
    status: "Active",
    joinDate: "15 June 2025",
    remarks: "Good lab attendance, timely workbook completion.",
    attendanceHistory: [
      { lectureId: "lec-6", subject: "Physics", topic: "Rotational Motion - Torque", date: "20 Nov 2026", status: "Present" },
      { lectureId: "lec-7", subject: "Mathematics", topic: "Coordinate Geometry - Circles", date: "19 Nov 2026", status: "Present" }
    ]
  },
  {
    id: "stu-106",
    name: "Tanvi Deshmukh",
    rollNo: "EA-2026-06",
    batchId: "batch-3",
    batchName: "NEET 2026 - Batch C",
    email: "tanvi.d@gmail.com",
    phone: "+91 98450 77890",
    parentName: "Sunil Deshmukh",
    parentPhone: "+91 98450 11229",
    parentRelation: "Father",
    attendanceRate: 64.0, // Below 75%
    status: "Active",
    joinDate: "05 May 2025",
    remarks: "Consecutive absences on Saturdays. Medical certificate submitted for Oct.",
    attendanceHistory: [
      { lectureId: "lec-8", subject: "Biology", topic: "Human Physiology - Neural Control", date: "20 Nov 2026", status: "Absent" },
      { lectureId: "lec-9", subject: "Chemistry", topic: "Coordination Compounds", date: "19 Nov 2026", status: "Absent" }
    ]
  },
  {
    id: "stu-107",
    name: "Zoya Merchant",
    rollNo: "EA-2026-07",
    batchId: "batch-3",
    batchName: "NEET 2026 - Batch C",
    email: "zoya.m@yahoo.com",
    phone: "+91 98700 44556",
    parentName: "Farhan Merchant",
    parentPhone: "+91 98700 88990",
    parentRelation: "Father",
    attendanceRate: 96.0,
    status: "Active",
    joinDate: "02 May 2025",
    remarks: "Exceptional biology lab logbook scores.",
    attendanceHistory: [
      { lectureId: "lec-8", subject: "Biology", topic: "Human Physiology - Neural Control", date: "20 Nov 2026", status: "Present" },
      { lectureId: "lec-9", subject: "Chemistry", topic: "Coordination Compounds", date: "19 Nov 2026", status: "Present" }
    ]
  }
];

export const INITIAL_BATCHES = [
  {
    id: "batch-1",
    name: "JEE 2027 - Batch A",
    grade: "Grade 11 · Engineering",
    room: "Lecture Hall 101",
    teacherId: "tch-1",
    teacherName: "Prof. Arvind Ramanathan",
    subject: "Advanced Mathematics",
    studentCount: 38,
    avgAttendance: 86.4,
    scheduleSummary: "Mon, Wed, Fri · 09:30 AM - 11:30 AM",
    description: "Flagship 2-year IIT-JEE advanced cohort focusing on theoretical depth and mock Olympiad problem solving."
  },
  {
    id: "batch-2",
    name: "JEE 2027 - Batch B",
    grade: "Grade 11 · Engineering",
    room: "Hall 204",
    teacherId: "tch-2",
    teacherName: "Dr. Shalini Kulkarni",
    subject: "Classical & Modern Physics",
    studentCount: 42,
    avgAttendance: 89.1,
    scheduleSummary: "Tue, Thu, Sat · 02:00 PM - 04:00 PM",
    description: "Evening batch designed with focused mechanics, wave theory and problem clinics."
  },
  {
    id: "batch-3",
    name: "NEET 2026 - Batch C",
    grade: "Grade 12 · Medical",
    room: "BioLab 3",
    teacherId: "tch-3",
    teacherName: "Dr. P. N. Mukherjee",
    subject: "Cell Biology & Physiology",
    studentCount: 34,
    avgAttendance: 78.5,
    scheduleSummary: "Mon to Sat · 11:30 AM - 01:30 PM",
    description: "Intensive 1-year NEET revision cohort with daily NCERT drill papers and clinical case studies."
  }
];

export const INITIAL_LECTURES = [
  {
    id: "lec-1",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    subject: "Mathematics",
    topic: "Complex Numbers - De Moivre's Theorem & Roots of Unity",
    teacherId: "tch-1",
    teacherName: "Prof. Arvind Ramanathan",
    room: "Lecture Hall 101",
    date: "2026-11-20",
    time: "09:30 AM - 11:30 AM",
    status: "Finished", // Finished | In Progress | Scheduled
    attendanceMarked: true,
    totalEnrolled: 38,
    presentCount: 33,
    absentCount: 4,
    lateCount: 1
  },
  {
    id: "lec-8",
    batchId: "batch-3",
    batchName: "NEET 2026 - Batch C",
    subject: "Biology",
    topic: "Human Physiology - Chemical Coordination & Pituitary Axis",
    teacherId: "tch-3",
    teacherName: "Dr. P. N. Mukherjee",
    room: "BioLab 3",
    date: "2026-11-20",
    time: "11:30 AM - 01:30 PM",
    status: "In Progress",
    attendanceMarked: false,
    totalEnrolled: 34,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0
  },
  {
    id: "lec-6",
    batchId: "batch-2",
    batchName: "JEE 2027 - Batch B",
    subject: "Physics",
    topic: "Rotational Dynamics - Moment of Inertia for Composite Bodies",
    teacherId: "tch-2",
    teacherName: "Dr. Shalini Kulkarni",
    room: "Hall 204",
    date: "2026-11-20",
    time: "02:00 PM - 04:00 PM",
    status: "Scheduled",
    attendanceMarked: false,
    totalEnrolled: 42,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0
  },
  {
    id: "lec-9",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    subject: "Chemistry",
    topic: "Thermodynamics - Gibbs Free Energy & Spontaneity",
    teacherId: "tch-4",
    teacherName: "Dr. Hemant Bhargava",
    room: "Lecture Hall 101",
    date: "2026-11-21",
    time: "09:30 AM - 11:30 AM",
    status: "Scheduled",
    attendanceMarked: false,
    totalEnrolled: 38,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0
  }
];

export const INITIAL_NOTICES = [
  {
    id: "not-1",
    title: "All-India Mock Examination #4 Schedule Released",
    batchId: "all",
    batchName: "All Batches",
    author: "Admin · Academic Cell",
    date: "20 Nov 2026, 08:30 AM",
    urgent: true,
    content: "The upcoming National Ranker Test #4 will be conducted on Sunday, 23 Nov 2026 across Hall A and BioLab 3. Students must report 30 minutes prior to paper distribution."
  },
  {
    id: "not-2",
    title: "Mandatory Parent-Teacher Meeting for Sub-75% Attendance",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    author: "Prof. Arvind Ramanathan",
    date: "19 Nov 2026, 04:15 PM",
    urgent: false,
    content: "Individual performance reviews will be held on Saturday morning. Students falling below the 75% attendance criterion must be accompanied by their guardian."
  },
  {
    id: "not-3",
    title: "Physics Problem Sheet #12 Uploaded to Resource Vault",
    batchId: "batch-2",
    batchName: "JEE 2027 - Batch B",
    author: "Dr. Shalini Kulkarni",
    date: "18 Nov 2026, 06:00 PM",
    urgent: false,
    content: "Workbook questions 1 to 45 covering Angular Momentum Conservation are due before Monday's lecture."
  }
];

export const INITIAL_RESOURCES = [
  {
    id: "res-1",
    title: "Calculus Formula Vault & Standard Integrals.pdf",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    category: "Formula Sheet",
    size: "2.4 MB",
    uploadedBy: "Prof. Arvind Ramanathan",
    date: "19 Nov 2026",
    downloadUrl: "#"
  },
  {
    id: "res-2",
    title: "Electromagnetic Induction - Class Handwritten Notes.pdf",
    batchId: "batch-1",
    batchName: "JEE 2027 - Batch A",
    category: "Lecture Notes",
    size: "6.8 MB",
    uploadedBy: "Dr. Shalini Kulkarni",
    date: "18 Nov 2026",
    downloadUrl: "#"
  },
  {
    id: "res-3",
    title: "NEET 2026 High-Yield Human Physiology Flashcards.pdf",
    batchId: "batch-3",
    batchName: "NEET 2026 - Batch C",
    category: "Revision Aid",
    size: "4.1 MB",
    uploadedBy: "Dr. P. N. Mukherjee",
    date: "17 Nov 2026",
    downloadUrl: "#"
  },
  {
    id: "res-4",
    title: "NCERT Exemplar Solutions - Rotational Mechanics.pdf",
    batchId: "batch-2",
    batchName: "JEE 2027 - Batch B",
    category: "Assignment",
    size: "3.2 MB",
    uploadedBy: "Admin Academic Cell",
    date: "15 Nov 2026",
    downloadUrl: "#"
  }
];

export const INITIAL_ACTIVITY_LOG = [
  {
    id: "act-1",
    action: "Attendance Recorded",
    category: "Attendance",
    actorRole: "Teacher",
    actorName: "Prof. Arvind Ramanathan",
    batchName: "JEE 2027 - Batch A",
    details: "Marked attendance for 38 students. 33 Present, 4 Absent, 1 Late.",
    timestamp: "20 Nov 2026, 11:35 AM"
  },
  {
    id: "act-2",
    action: "Parent Call Logged",
    category: "Parent Calls",
    actorRole: "Admin",
    actorName: "Siddharth Nair",
    batchName: "JEE 2027 - Batch A",
    details: "Called Rajesh Sharma regarding Aarav Sharma (68% attendance). Parent acknowledged transit illness.",
    timestamp: "20 Nov 2026, 10:15 AM"
  },
  {
    id: "act-3",
    action: "Notice Published",
    category: "Notices",
    actorRole: "Admin",
    actorName: "Academic Cell",
    batchName: "All Batches",
    details: "Published: All-India Mock Examination #4 Schedule Released",
    timestamp: "20 Nov 2026, 08:30 AM"
  },
  {
    id: "act-4",
    action: "Lecture Scheduled",
    category: "Lectures",
    actorRole: "Admin",
    actorName: "Siddharth Nair",
    batchName: "NEET 2026 - Batch C",
    details: "Added Chemistry lecture with Dr. Hemant Bhargava on 21 Nov 2026.",
    timestamp: "19 Nov 2026, 05:40 PM"
  },
  {
    id: "act-5",
    action: "Resource Uploaded",
    category: "Resources",
    actorRole: "Teacher",
    actorName: "Prof. Arvind Ramanathan",
    batchName: "JEE 2027 - Batch A",
    details: "Uploaded Calculus Formula Vault & Standard Integrals.pdf",
    timestamp: "19 Nov 2026, 04:00 PM"
  }
];

export const ATTENDANCE_TREND_DATA = [
  { week: "W1 (Oct)", "JEE-A": 89, "JEE-B": 91, "NEET-C": 82 },
  { week: "W2 (Oct)", "JEE-A": 87, "JEE-B": 88, "NEET-C": 79 },
  { week: "W3 (Oct)", "JEE-A": 84, "JEE-B": 92, "NEET-C": 75 },
  { week: "W4 (Nov)", "JEE-A": 88, "JEE-B": 89, "NEET-C": 80 },
  { week: "Current",  "JEE-A": 86, "JEE-B": 89, "NEET-C": 78 }
];
