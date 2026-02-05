/*
  # Authentication Setup
  
  1. Tables
    - Profiles table with role-based access
    - Initial demo users for testing
  
  2. Security
    - RLS policies for profile access
    - Secure password handling
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('owner', 'tenant')),
  aadhaar_number text,
  phone_number text,
  date_of_birth date,
  profile_photo_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create demo users
INSERT INTO auth.users (id, email, role, encrypted_password)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'owner@example.com', 'authenticated', crypt('demo123', gen_salt('bf'))),
  ('00000000-0000-0000-0000-000000000002', 'tenant@example.com', 'authenticated', crypt('demo123', gen_salt('bf')));

INSERT INTO profiles (id, email, full_name, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'owner@example.com', 'Demo Owner', 'owner'),
  ('00000000-0000-0000-0000-000000000002', 'tenant@example.com', 'Demo Tenant', 'tenant');