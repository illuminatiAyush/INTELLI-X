import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runE2E() {
  console.log("Starting End-to-End Verification...")
  
  // Clean up previous test users if any
  try {
    // We cannot clean up users with anon key, this is just a test of the regular flows
  } catch(e) {}

  const adminEmail = `admin-${Date.now()}@test.com`
  const password = "password123"

  // 1. Create Institute + Admin
  console.log("1. Creating Institute & Admin...")
  const { data: instData, error: instError } = await supabase.functions.invoke('create-institute-admin', {
    body: {
      admin_email: adminEmail,
      admin_password: password,
      institute_name: "E2E Testing Institute",
      email: adminEmail,
      phone: "123456789",
      owner_name: "E2E Tester"
    }
  })
  
  if (instError || instData?.error) {
    console.error("❌ Institute Creation Failed:", instError || instData.error)
    process.exit(1)
  }
  
  const instituteId = instData.institute_id
  console.log("✅ Institute created with ID:", instituteId)

  // 2. Login as Admin
  console.log(`2. Logging in as Admin (${adminEmail})...`)
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: password
  })

  if (loginError) {
    console.error("❌ Login Failed:", loginError.message)
    process.exit(1)
  }
  
  console.log("✅ Admin logged in. Access Token retrieved.")

  // 3. Admin creates Teacher
  console.log("3. Admin creating Teacher...")
  const teacherEmail = `teacher-${Date.now()}@test.com`
  const { data: teacherData, error: teacherError } = await supabase.functions.invoke('create-user', {
    body: {
      email: teacherEmail,
      password: "password123",
      role: 'teacher',
      name: "Test Teacher",
      subject: "Science",
      institute_id: instituteId
    }
  })

  if (teacherError || teacherData?.error) {
    console.error("❌ Teacher Creation Failed:", teacherError || teacherData.error)
    process.exit(1)
  }
  console.log("✅ Teacher created successfully. ID:", teacherData.user_id)

  // 4. Admin creates Student
  console.log("4. Admin creating Student...")
  const studentEmail = `student-${Date.now()}@test.com`
  const { data: studentData, error: studentError } = await supabase.functions.invoke('create-user', {
    body: {
      email: studentEmail,
      password: "password123",
      role: 'student',
      name: "Test Student",
      phone: "9876543210",
      institute_id: instituteId
    }
  })

  if (studentError || studentData?.error) {
    console.error("❌ Student Creation Failed:", studentError || studentData.error)
    process.exit(1)
  }
  console.log("✅ Student created successfully. ID:", studentData.user_id)

  console.log("=========================================")
  console.log("🚀 ALL CRITICAL AUTH FLOWS WORK END-TO-END!")
  console.log("=========================================")
}

runE2E().catch(console.error)
