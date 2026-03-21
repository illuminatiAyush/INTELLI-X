import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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
}

main()
