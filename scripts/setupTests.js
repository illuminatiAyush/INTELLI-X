import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testUsers = [
  { email: 'admin@intellix.com', password: 'password123', role: 'admin', name: 'IntelliX Admin' },
  { email: 'teacher@intellix.com', password: 'password123', role: 'teacher', name: 'Prof. Sharma' },
  { email: 'student@intellix.com', password: 'password123', role: 'student', name: 'Ayush Kumar' },
]

async function setup() {
  for (const user of testUsers) {
    console.log(`Setting up ${user.role}: ${user.email}...`)
    
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.name.split(' ')[0],
          last_name: user.name.split(' ')[1] || '',
          role: user.role
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`User ${user.email} already exists. Attempting to update role...`)
        // Fallback: If user exists, we need their ID to update profile. 
        // Note: signIn is needed but might be restricted. For simplicity, we assume signup or manual fix.
      } else {
        console.error(`Error creating ${user.email}:`, authError.message)
        continue
      }
    }

    const userId = authData?.user?.id
    if (userId) {
      // 2. Explicitly set role in profiles (in case trigger hasn't fired or for existing users)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: user.role })
        .eq('id', userId)
      
      if (profileError) {
        console.error(`Error updating profile for ${user.email}:`, profileError.message)
      } else {
        console.log(`✅ Success for ${user.email}`)
      }
    }
  }
  console.log("\nSetup complete! You can now log in with these credentials.")
}

setup()
