import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://odeajdvhnuvzybharwow.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZWFqZHZobnV2enliaGFyd293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTQwMjcsImV4cCI6MjA4ODgzMDAyN30.OXfMuDMoVIzwBeOeEq6BQwaAZd7SfjXcEcnRdRX2Bs8'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🔍 Testing Supabase connectivity...')
console.log(`📡 URL: ${SUPABASE_URL}`)

// 1. Test basic HTTP reachability
try {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  })
  console.log(`\n✅ HTTP reachable — Status: ${res.status} ${res.statusText}`)
  if (res.status === 200) {
    console.log('   PostgREST schema accessible.')
  } else {
    const body = await res.json()
    console.log('   Response:', JSON.stringify(body))
  }
} catch (e) {
  console.error('❌ HTTP unreachable:', e.message)
}

// 2. Test a real table query (profiles)
try {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) {
    console.log(`\n⚠️  profiles table query error: ${error.message} (code: ${error.code})`)
  } else {
    console.log(`\n✅ profiles table query OK — ${data.length} row(s) returned`)
  }
} catch (e) {
  console.error('❌ profiles query exception:', e.message)
}

// 3. Check auth service
try {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.log(`\n⚠️  Auth service error: ${error.message}`)
  } else {
    console.log(`\n✅ Auth service reachable — session: ${data.session ? 'active' : 'none (expected for anon)'}`)
  }
} catch (e) {
  console.error('❌ Auth service exception:', e.message)
}

// 4. Decode JWT token info
const payload = JSON.parse(Buffer.from(SUPABASE_ANON_KEY.split('.')[1], 'base64').toString())
const expiry = new Date(payload.exp * 1000)
const now = new Date()
const isExpired = now > expiry
console.log(`\n🔑 JWT Info:`)
console.log(`   Role: ${payload.role}`)
console.log(`   Issued: ${new Date(payload.iat * 1000).toISOString()}`)
console.log(`   Expires: ${expiry.toISOString()}`)
console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`)

console.log('\n✅ Supabase connectivity check complete.')
