import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_APP_URL'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

// We will grep the env file
import fs from 'fs'
const envFile = fs.readFileSync('.env', 'utf-8')
const lines = envFile.split('\n')
let url, key;
lines.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL')) url = line.split('=')[1].trim()
  if (line.startsWith('VITE_SUPABASE_ANON_KEY')) key = line.split('=')[1].trim()
})

const supabase = createClient(url, key)

async function test() {
  const { data: institute, error: instError } = await supabase
    .rpc('get_institute_by_code', { code: '1B46C6' })
    .single()

  console.log('Institute fetch:', institute, instError)

  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Math.random() + '@gmail.com',
    password: 'password123',
    options: {
      data: {
        role: 'student',
        first_name: 'John Doe',
        institute_id: institute?.id
      }
    }
  })

  console.log('SignUp Data:', data)
  console.log('SignUp Error:', error)
}

test()
