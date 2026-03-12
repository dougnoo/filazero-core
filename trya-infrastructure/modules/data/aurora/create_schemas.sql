-- Script to create additional schemas in Aurora PostgreSQL
-- Execute this script after the Aurora cluster is created

-- Create platform schema
CREATE SCHEMA IF NOT EXISTS platform;

-- Grant permissions to the application user (if needed)
-- GRANT ALL PRIVILEGES ON SCHEMA platform TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA platform TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA platform TO your_app_user;

-- Set default privileges for future objects
-- ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL ON TABLES TO your_app_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL ON SEQUENCES TO your_app_user;
