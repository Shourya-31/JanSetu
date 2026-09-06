-- PostgreSQL DDL Schema for JanSetu DMFT Village Census Platform (1 TB Enterprise Scale)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Surveyors & Admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('surveyor', 'admin')),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Master Hierarchy Reference Table
CREATE TABLE IF NOT EXISTS narayanpur_hierarchy (
  id SERIAL PRIMARY KEY,
  block_name VARCHAR(100) NOT NULL,
  panchayat_name VARCHAR(100) NOT NULL,
  village_name VARCHAR(100) NOT NULL,
  CONSTRAINT unique_location_hierarchy UNIQUE (block_name, panchayat_name, village_name)
);

-- 3. Village Profiles Table
CREATE TABLE IF NOT EXISTS village_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block VARCHAR(100) NOT NULL,
  panchayat VARCHAR(100) NOT NULL,
  village_name VARCHAR(100) UNIQUE NOT NULL,
  total_population INT NOT NULL DEFAULT 0,
  total_households INT NOT NULL DEFAULT 0,
  sc_count INT DEFAULT 0,
  st_count INT DEFAULT 0,
  pucca_houses INT DEFAULT 0,
  semi_pucca_houses INT DEFAULT 0,
  kaccha_houses INT DEFAULT 0,
  mine_distance_km VARCHAR(50) NOT NULL,
  has_pucca_road VARCHAR(10) NOT NULL,
  monsoon_cut_off VARCHAR(10) NOT NULL,
  school_type VARCHAR(100) NOT NULL,
  hospital_type VARCHAR(100) NOT NULL,
  electrification VARCHAR(100) NOT NULL,
  quality_metrics JSONB DEFAULT '{}'::jsonb,
  gap_matrix JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Household Surveys Table
CREATE TABLE IF NOT EXISTS household_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id VARCHAR(50) UNIQUE NOT NULL,
  village_name VARCHAR(100) NOT NULL REFERENCES village_profiles(village_name) ON DELETE RESTRICT,
  house_number INT NOT NULL,
  head_name VARCHAR(150) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  caste VARCHAR(100) NOT NULL,
  is_bpl VARCHAR(10) NOT NULL,
  total_members INT NOT NULL DEFAULT 1,
  elders_count INT DEFAULT 0,
  children_count INT DEFAULT 0,
  unemployed_count INT DEFAULT 0,
  income_source VARCHAR(100) NOT NULL,
  missing_aadhaar INT DEFAULT 0,
  missing_caste_cert INT DEFAULT 0,
  missing_ayushman INT DEFAULT 0,
  missing_voter_id INT DEFAULT 0,
  is_mining_worker VARCHAR(10) NOT NULL,
  house_type VARCHAR(50) NOT NULL,
  has_toilet VARCHAR(10) NOT NULL,
  has_tap_water VARCHAR(10) NOT NULL,
  survey_answers JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id),
  version INT NOT NULL DEFAULT 1,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_house_per_village UNIQUE (village_name, house_number)
);

-- 5. Materialized View for Instant District Cluster Analytics (< 10ms on 1 TB Data)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_district_cluster_analytics AS
SELECT 
  village_name,
  COUNT(*) as total_households,
  SUM(total_members) as total_population,
  SUM(CASE WHEN is_bpl = 'Yes' THEN 1 ELSE 0 END) as bpl_count,
  SUM(missing_aadhaar) as missing_aadhaar_total,
  SUM(missing_ayushman) as missing_ayushman_total,
  SUM(unemployed_count) as unemployed_youth_total,
  SUM(CASE WHEN is_mining_worker = 'Yes' THEN 1 ELSE 0 END) as mining_worker_total
FROM household_surveys
GROUP BY village_name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_district_cluster_village ON mv_district_cluster_analytics(village_name);

-- 6. Audit Log Table
CREATE TABLE IF NOT EXISTS survey_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES users(id),
  changes JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B-Tree Compound Indexes for Ultra-Fast Dynamic Admin Query Filtering
CREATE INDEX IF NOT EXISTS idx_households_village ON household_surveys(village_name);
CREATE INDEX IF NOT EXISTS idx_households_multi_filter ON household_surveys(village_name, is_bpl, caste, is_mining_worker);
CREATE INDEX IF NOT EXISTS idx_households_missing_docs ON household_surveys(missing_aadhaar, missing_ayushman);
CREATE INDEX IF NOT EXISTS idx_households_mobile ON household_surveys(mobile);
