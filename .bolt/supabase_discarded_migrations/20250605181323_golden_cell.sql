/*
  # Create profiles table and demo users
  
  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text, check constraint)
      - `aadhaar_number` (text)
      - `phone_number` (text)
      - `date_of_birth` (date)
      - `profile_photo_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on profiles table
    - Add policies for viewing and updating profiles
  
  3. Demo Data
    - Create demo owner and tenant users
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
END $$;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create demo users if they don't exist
DO $$ 
BEGIN
  -- Insert demo owner
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    INSERT INTO auth.users (id, email, role, encrypted_password, email_confirmed_at)
    VALUES ('00000000-0000-0000-0000-000000000001', 'owner@example.com', 'authenticated', 
           crypt('demo123', gen_salt('bf')), now());
  END IF;
  
  -- Insert demo tenant
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002') THEN
    INSERT INTO auth.users (id, email, role, encrypted_password, email_confirmed_at)
    VALUES ('00000000-0000-0000-0000-000000000002', 'tenant@example.com', 'authenticated', 
           crypt('demo123', gen_salt('bf')), now());
  END IF;
END $$;

-- Insert profile records if they don't exist
DO $$
BEGIN
  -- Insert demo owner profile
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES ('00000000-0000-0000-0000-000000000001', 'owner@example.com', 'Demo Owner', 'owner');
  END IF;
  
  -- Insert demo tenant profile
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000002') THEN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES ('00000000-0000-0000-0000-000000000002', 'tenant@example.com', 'Demo Tenant', 'tenant');
  END IF;
END $$;