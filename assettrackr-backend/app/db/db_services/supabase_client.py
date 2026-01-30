from supabase import create_client, Client
import os

url = os.getenv("PUBLIC_SUPABASE_URL", "")
key = os.getenv("PUBLIC_SUPABASE_ANON_KEY", "")

supabase: Client = create_client(url, key)