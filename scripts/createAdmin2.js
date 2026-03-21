import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  console.log("Creating admin user...")
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@intellix.com',
    password: 'password123',
    options: {
      data: {
        name: 'IntelliX Admin'
      }
    }
  })
  
  if (error) {
    console.error("Error signing up:", error.message)
    return
  }
  
  console.log("Successfully created user:", data.user?.email)
  console.log("ID:", data.user?.id)

  // Explicitly make them an admin in the profiles table just in case the trigger didn't fire with the right role yet or default is student
  if (data.user) {
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id)
      console.log("Ensure user role is set to admin.")
  }
}

main()
