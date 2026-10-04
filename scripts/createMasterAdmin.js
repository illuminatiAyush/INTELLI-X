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

async function createMasterAdmin() {
  console.log("Creating Master Admin account...")
  
  const { data, error } = await supabase.auth.signUp({
    email: 'master@intellix.com',
    password: 'password123',
    options: {
      data: {
        first_name: 'Master',
        last_name: 'Admin',
        role: 'master_admin'
      }
    }
  })

  if (error) {
    console.error("Error creating master admin:", error.message)
    process.exit(1)
  }

  console.log("Master Admin created successfully in Auth.")
  
  // Wait a second for trigger to execute
  await new Promise(r => setTimeout(r, 1000));
  
  // Force update to ensure role is master_admin (bypassing any trigger race conditions)
  if (data.user?.id) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'master_admin' })
      .eq('id', data.user.id);
      
    if (profileError) {
       console.error("Could not force update profile role:", profileError);
    } else {
       console.log("Profile role strictly set to master_admin.");
    }
  }

  console.log("\n--- CREDENTIALS ---")
  console.log("Email: master@intellix.com")
  console.log("Password: password123")
  console.log("-------------------")
}

createMasterAdmin()
