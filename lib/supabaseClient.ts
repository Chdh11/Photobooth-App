import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylbxpomrxdmmlmpnrfvb.supabase.co' // replace with yours
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsYnhwb21yeGRtbWxtcG5yZnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTgyNjAsImV4cCI6MjA2NjY5NDI2MH0.gj0yuyAndsDMXtSe9tWMdb_mPn2H9JoeN7gKWD5CmwE' // replace with yours

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;