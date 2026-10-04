import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, ClipboardCheck, TrendingUp, AlertTriangle, Trophy, Target, Bell } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import StatsCard from '../../components/ui/StatsCard'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

// Import student analytics components
import {
  fetchStudentStats,
  fetchTestScores,
  fetchSubjectPerformance,
} from '../../services/profileService'
import PerformanceChart from '../../components/profile/PerformanceChart'
import StrengthWeak from '../../components/profile/StrengthWeak'
import Achievements from '../../components/profile/Achievements'
import Notifications from '../../components/profile/Notifications'
import Goals from '../../components/profile/Goals'

const AnalyticsPage = () => {
  const { isDark } = useTheme()
  const { role, profile } = useAuth()
  const { data: analyticsData, loading: analyticsLoading } = useAppQuery('analytics-metrics' + (role === 'student' ? '-student' : ''), async () => {
    if (!profile) return null
    
    // Use profile.id directly — all FKs (batch_students, results, attendance) reference students.profile_id
    const resolvedStudentId = profile.id;

    // DIFFERENT LOGIC FOR STUDENT - Enhanced with detailed analytics
    if (role === 'student') {
      // 1. Fetch enhanced data for detailed analytics
      const [
        { data: myAttendance },
        { data: myResults },
        { data: allResults },
        { data: myBatches },
        stats,
        testScores,
        subjects
      ] = await Promise.all([
        supabase.from('attendance').select('status, batch_id').eq('student_id', resolvedStudentId),
        supabase.from('results').select('marks, tests!inner(total_marks, batch_id, title)').eq('student_id', resolvedStudentId),
        supabase.from('results').select('student_id, marks, tests!inner(total_marks)'),
        supabase.from('batch_students').select('batches(id, name, subject)').eq('student_id', resolvedStudentId),
        fetchStudentStats(resolvedStudentId),
        fetchTestScores(resolvedStudentId),
        fetchSubjectPerformance(resolvedStudentId)
      ])

      // 2. Process Attendance
      const attTotal = myAttendance?.length || 0
      const attPresent = myAttendance?.filter(a => a.status === 'present').length || 0
      const attRate = attTotal ? ((attPresent / attTotal) * 100).toFixed(1) : 0

      // 3. Process Results
      const resultsList = myResults || []
      const totalMarks = resultsList.reduce((s, r) => s + (r.marks || 0), 0)
      const totalPossible = resultsList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
      const avgScore = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0

      // 4. Calculate Rank (Simple global rank by avg %)
      const studentAvgScores = {}
      allResults?.forEach(r => {
        if (!studentAvgScores[r.student_id]) studentAvgScores[r.student_id] = { m: 0, p: 0 }
        studentAvgScores[r.student_id].m += (r.marks || 0)
        studentAvgScores[r.student_id].p += (r.tests?.total_marks || 100)
      })
      const rankings = Object.entries(studentAvgScores)
        .map(([id, s]) => ({ id, avg: s.p ? (s.m / s.p) : 0 }))
        .sort((a, b) => b.avg - a.avg)
      
      const myRank = rankings.findIndex(r => String(r.id) === String(resolvedStudentId)) + 1 || '-'

      // 5. Batch Performance for Student
      const processedBatches = (myBatches || []).map(b => {
        const batchId = b.batches?.id
        const batchAtt = (myAttendance || []).filter(a => a.batch_id === batchId)
        const bTotal = batchAtt.length
        const bPresent = batchAtt.filter(a => a.status === 'present').length
        const bRate = bTotal ? ((bPresent / bTotal) * 100).toFixed(1) : 0

        const batchRes = resultsList.filter(r => r.tests?.batch_id === batchId)
        const bMarks = batchRes.reduce((s, r) => s + (r.marks || 0), 0)
        const bPossible = batchRes.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
        const bAvg = bPossible ? ((bMarks / bPossible) * 100).toFixed(1) : 0

        return {
          id: batchId,
          name: b.batches?.name,
          subject: b.batches?.subject,
          attendanceRate: bRate,
          avgMarks: bAvg,
          testsTaken: batchRes.length
        }
      })

      return {
        isStudent: true,
        overallStats: {
          avgAttendance: attRate,
          totalTests: resultsList.length,
          avgScore: avgScore,
          rank: myRank
        },
        batchStats: processedBatches,
        recentResults: resultsList.slice(0, 5).map(r => ({
          title: r.tests?.title,
          marks: r.marks,
          total: r.tests?.total_marks,
          percent: ((r.marks / (r.tests?.total_marks || 100)) * 100).toFixed(1)
        })),
        // Enhanced analytics data
        detailedStats: stats,
        testScores: testScores,
        subjects: subjects,
        currentGoalStats: stats ? { score: stats.avgScore || 0, rank: stats.rank || '-' } : undefined
      }
    }

    // DIFFERENT LOGIC FOR ADMIN/TEACHER
    if (role === 'teacher') {
      // For teachers, only show analytics for their assigned batches
      const { data: teacherBatches } = await supabase
        .from('batches')
        .select('id, name, subject')
        .eq('teacher_id', profile.id)

      const teacherBatchIds = teacherBatches?.map(b => b.id) || []
      
      if (teacherBatchIds.length === 0) {
        return {
          isTeacher: true,
          batchStats: [],
          topStudents: [],
          weakStudents: [],
          overallStats: { totalStudents: 0, avgAttendance: 0, totalTests: 0, avgScore: 0 }
        }
      }

      // Fetch attendance only for teacher's batches
      const { data: attendance } = await supabase
        .from('attendance')
        .select('batch_id, status')
        .in('batch_id', teacherBatchIds)

      // Fetch results only for teacher's batches
      const { data: results } = await supabase
        .from('results')
        .select(`
          student_id, 
          marks, 
          tests!inner(total_marks, batch_id),
          students(id, name)
        `)
        .in('tests.batch_id', teacherBatchIds)
      
      // Fetch student count for teacher's batches
      const { data: batch_students } = await supabase
        .from('batch_students')
        .select('student_id, batch_id')
        .in('batch_id', teacherBatchIds)
      
      // Fetch test count for teacher's batches
      const { count: testCount } = await supabase
        .from('tests')
        .select('id', { count: 'exact', head: true })
        .in('batch_id', teacherBatchIds)

      const batchList = teacherBatches || []
      const attendanceList = attendance || []
      const resultsList = results || []
      const batchStudentsList = batch_students || []

      const batchAnalytics = batchList.map(batch => {
        const batchAttendance = attendanceList.filter(a => a.batch_id === batch.id)
        const present = batchAttendance.filter(a => a.status === 'present').length
        const total = batchAttendance.length
        const rate = total ? ((present / total) * 100).toFixed(1) : 0
        const batchResults = resultsList.filter(r => r.tests?.batch_id === batch.id)
        const avgMarks = batchResults.length ? (batchResults.reduce((s, r) => s + r.marks, 0) / batchResults.length).toFixed(1) : 0
        return { 
          ...batch, 
          studentCount: batchStudentsList.filter(s => s.batch_id === batch.id).length, 
          attendanceRate: rate, 
          avgMarks, 
          testsTaken: batchResults.length 
        }
      })

      const studentScores = {}
      resultsList.forEach((r, i) => {
        if (!studentScores[r.student_id]) {
          studentScores[r.student_id] = { 
            totalMarks: 0, 
            totalPossible: 0, 
            count: 0,
            student: r.students 
          }
        }
        studentScores[r.student_id].totalMarks += r.marks
        studentScores[r.student_id].totalPossible += (r.tests?.total_marks || 100)
        studentScores[r.student_id].count += 1
      })

      const scoredStudents = Object.entries(studentScores).map(([sid, s]) => {
        const student = s.student || { name: "Unknown" }
        const studentName = student?.full_name || student?.name || "Unknown";
        
        return { 
          id: sid, 
          name: studentName, 
          percentage: s.totalPossible ? ((s.totalMarks / s.totalPossible) * 100).toFixed(1) : 0, 
          testsAttempted: s.count 
        }
      }).sort((a, b) => b.percentage - a.percentage)

      const totalAttendance = attendanceList.length
      const totalPresent = attendanceList.filter(a => a.status === 'present').length
      const avgAttendance = totalAttendance ? ((totalPresent / totalAttendance) * 100).toFixed(1) : 0
      const totalMarks = resultsList.reduce((s, r) => s + r.marks, 0)
      const totalPossible = resultsList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
      const avgScore = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0

      return {
        isTeacher: true,
        batchStats: batchAnalytics,
        topStudents: scoredStudents.slice(0, 5),
        weakStudents: scoredStudents.filter(s => parseFloat(s.percentage) < 40).slice(0, 5),
        overallStats: { 
          totalStudents: batchStudentsList.length, 
          avgAttendance, 
          totalTests: testCount || 0, 
          avgScore 
        }
      }
    }

    // LOGIC FOR ADMIN/MASTER_ADMIN - Institute-wide analytics
    // Fetch batches with student counts
    const { data: batches } = await supabase.from('batches').select('id, name, subject')
    // Fetch all attendance records
    const { data: attendance } = await supabase.from('attendance').select('batch_id, status')
    // Fetch all results with test and student info
    const { data: results } = await supabase
      .from('results')
      .select(`
        student_id, 
        marks, 
        tests(total_marks, batch_id),
        students(id, name)
      `)
    
    // Fetch all student to batch mappings
    const { data: batch_students } = await supabase.from('batch_students').select('student_id, batch_id')
    
    // Fetch students list for overall count (can be used to verify data)
    const { data: students } = await supabase.from('students').select('id, name')
    // Fetch test count
    const { count: testCount } = await supabase.from('tests').select('id', { count: 'exact', head: true })

    const batchList = batches || []
    const attendanceList = attendance || []
    const resultsList = results || []
    const batchStudentsList = batch_students || []
    const studentList = students || []

    const batchAnalytics = batchList.map(batch => {
      const batchAttendance = attendanceList.filter(a => a.batch_id === batch.id)
      const present = batchAttendance.filter(a => a.status === 'present').length
      const total = batchAttendance.length
      const rate = total ? ((present / total) * 100).toFixed(1) : 0
      const batchResults = resultsList.filter(r => r.tests?.batch_id === batch.id)
      const avgMarks = batchResults.length ? (batchResults.reduce((s, r) => s + r.marks, 0) / batchResults.length).toFixed(1) : 0
      return { ...batch, studentCount: batchStudentsList.filter(s => s.batch_id === batch.id).length, attendanceRate: rate, avgMarks, testsTaken: batchResults.length }
    })

    const studentScores = {}
    resultsList.forEach((r, i) => {
      if (!studentScores[r.student_id]) {
        studentScores[r.student_id] = { 
          totalMarks: 0, 
          totalPossible: 0, 
          count: 0,
          student: r.students 
        }
      }
      studentScores[r.student_id].totalMarks += r.marks
      studentScores[r.student_id].totalPossible += (r.tests?.total_marks || 100)
      studentScores[r.student_id].count += 1
    })

    const scoredStudents = Object.entries(studentScores).map(([sid, s]) => {
      const student = s.student || studentList.find(st => st.id === sid)
      const studentName = student?.full_name || student?.name || "Unknown";
      
      return { 
        id: sid, 
        name: studentName, 
        percentage: s.totalPossible ? ((s.totalMarks / s.totalPossible) * 100).toFixed(1) : 0, 
        testsAttempted: s.count 
      }
    }).sort((a, b) => b.percentage - a.percentage)

    const totalAttendance = attendanceList.length
    const totalPresent = attendanceList.filter(a => a.status === 'present').length
    const avgAttendance = totalAttendance ? ((totalPresent / totalAttendance) * 100).toFixed(1) : 0
    const totalMarks = resultsList.reduce((s, r) => s + r.marks, 0)
    const totalPossible = resultsList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
    const avgScore = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0

    return {
      batchStats: batchAnalytics,
      topStudents: scoredStudents.slice(0, 5),
      weakStudents: scoredStudents.filter(s => parseFloat(s.percentage) < 40).slice(0, 5),
      overallStats: { totalStudents: studentList.length, avgAttendance, totalTests: testCount || 0, avgScore }
    }
  })

  const loading = analyticsLoading && !analyticsData
  const batchStats = analyticsData?.batchStats || []
  const topStudents = analyticsData?.topStudents || []
  const weakStudents = analyticsData?.weakStudents || []
  const recentResults = analyticsData?.recentResults || []
  const overallStats = analyticsData?.overallStats || { totalStudents: 0, avgAttendance: 0, totalTests: 0, avgScore: 0, rank: '-' }
  
  // Enhanced student data
  const detailedStats = analyticsData?.detailedStats || null
  const testScores = analyticsData?.testScores || null
  const subjects = analyticsData?.subjects || null
  const currentGoalStats = analyticsData?.currentGoalStats || undefined

  if (loading) return <DashboardSkeleton />

  if (role === 'student') {
    return (
      <div className="space-y-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-gray-900 tracking-tight"
          >
            Performance Analytics
          </motion.h1>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Comprehensive insights into your academic journey and learning progress
          </p>
        </div>

        {/* Overview Stats for Student */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Attendance Rate" value={`${overallStats.avgAttendance}%`} icon={ClipboardCheck} color={parseFloat(overallStats.avgAttendance) >= 75 ? 'green' : 'amber'} />
          <StatsCard title="Average Score" value={`${overallStats.avgScore}%`} icon={TrendingUp} color="blue" />
          <StatsCard title="Tests Completed" value={overallStats.totalTests} icon={BarChart3} color="purple" />
          <StatsCard title="Batch Rank" value={overallStats.rank === '-' ? '-' : `#${overallStats.rank}`} icon={Trophy} color="amber" />
        </div>

        {/* Performance Charts and Strengths/Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart testScores={testScores} loading={loading} />
          <div className="space-y-4">
            <StrengthWeak subjects={subjects} loading={loading} />
          </div>
        </div>

        {/* Batch-wise Breakdown for Student */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Batch Performance Breakdown</h2>
          </div>
          {batchStats.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">No batches joined yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="text-left py-3 px-4 font-semibold uppercase tracking-wider">Batch</th>
                    <th className="text-center py-3 px-4 font-semibold uppercase tracking-wider">Attendance</th>
                    <th className="text-center py-3 px-4 font-semibold uppercase tracking-wider">Avg Score</th>
                    <th className="text-center py-3 px-4 font-semibold uppercase tracking-wider">Tests Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStats.map(batch => (
                    <tr key={batch.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <div>
                          <p>{batch.name}</p>
                          <p className="text-[10px] text-gray-600">{batch.subject || '—'}</p>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${ parseFloat(batch.attendanceRate) >= 75 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500' }`}>
                          {batch.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-2 px-4 text-center text-gray-900 font-bold">{batch.avgMarks}%</td>
                      <td className="py-2 px-4 text-center text-gray-600">{batch.testsTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <Achievements />

        {/* Goals and Recent Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Goals currentStats={currentGoalStats} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Recent Test Scores</h2>
            </div>
            {recentResults.length === 0 ? (
              <p className="text-gray-600 text-sm py-4 text-center">No tests taken yet</p>
            ) : (
              <div className="space-y-3">
                {recentResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-all">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-600">{r.marks} / {r.total} marks</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{r.percent}%</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Notifications />
          
          {/* Analytics Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-blue-900">Analytics Summary</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Overall Performance:</span>
                <span className="font-bold text-blue-900">{overallStats.avgScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Attendance Rate:</span>
                <span className="font-bold text-blue-900">{overallStats.avgAttendance}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Tests Completed:</span>
                <span className="font-bold text-blue-900">{overallStats.totalTests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Current Rank:</span>
                <span className="font-bold text-blue-900">{overallStats.rank === '-' ? 'Not Available' : `#${overallStats.rank}`}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 tracking-tight"
        >
          {role === 'master_admin' ? 'System Analytics' : role === 'teacher' ? 'My Batch Analytics' : 'Institute Analytics'}
        </motion.h1>
        <p className="text-gray-600 text-sm mt-1 font-medium">
          {role === 'teacher' 
            ? 'Performance analytics for your assigned batches' 
            : 'Comprehensive performance and engagement metrics'
          }
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={overallStats.totalStudents} icon={Users} color="neutral" />
        <StatsCard title="Avg Attendance" value={`${overallStats.avgAttendance}%`} icon={ClipboardCheck} color="green" />
        <StatsCard title="Tests Conducted" value={overallStats.totalTests} icon={BarChart3} color="neutral" />
        <StatsCard title="Avg Score" value={`${overallStats.avgScore}%`} icon={TrendingUp} color="neutral" />
      </div>

      {/* Batch Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-100 text-slate-700 border border-slate-200'} shadow-sm`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Batch Performance</h2>
        </div>
        {batchStats.length === 0 ? (
          <p className="text-gray-600 text-sm py-4 text-center">No batches found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Batch</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Subject</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Students</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Attendance</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Avg Marks</th>
                </tr>
              </thead>
              <tbody>
                {batchStats.map(batch => (
                  <tr key={batch.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{batch.name}</td>
                    <td className="py-3 px-4 text-gray-600">{batch.subject || '—'}</td>
                    <td className="py-3 px-4 text-center text-gray-900 font-semibold">{batch.studentCount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${ parseFloat(batch.attendanceRate) >= 80 ? 'bg-green-500/10 text-green-500'
                          : parseFloat(batch.attendanceRate) >= 60
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                      }`}>
                        {batch.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-900 font-semibold">{batch.avgMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
          </div>
          {topStudents.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">No results data yet</p>
          ) : (
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${ 
                      i === 0 ? 'bg-white text-black' :
                      i === 1 ? 'bg-white/40 text-white' :
                      i === 2 ? 'bg-white/20 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-600">{s.testsAttempted} tests</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-500">{s.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weak Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Needs Attention</h2>
          </div>
          {weakStudents.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">No weak students detected 🎉</p>
          ) : (
            <div className="space-y-3">
              {weakStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-red-500/10 bg-red-500/5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-600">{s.testsAttempted} tests attempted</p>
                  </div>
                  <span className="text-sm font-bold text-red-500">{s.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsPage
