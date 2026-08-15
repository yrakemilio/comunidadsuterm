// ============================================================
// Configuración de Supabase
// ============================================================

const SUPABASE_URL = "https://anvnquhxrnhatrtczogd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudm5xdWh4cm5oYXRydGN6b2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDM5MDQsImV4cCI6MjEwMjMxOTkwNH0.LaQKvewh0rKLZo2FK0karc3hBCq9eUYTGTLbD64O-MI";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
