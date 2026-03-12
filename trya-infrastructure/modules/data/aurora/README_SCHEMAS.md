# Aurora PostgreSQL - Creating Additional Schemas

## Overview

This Aurora module supports the creation of additional schemas beyond the default `public` schema. The cluster has **Data API enabled**, which allows you to use the AWS RDS Query Editor directly from the console without needing a bastion host or VPN connection.

## Quick Start (Recommended)

The easiest way to create schemas is using the AWS RDS Query Editor v2:

1. Open AWS Console → RDS → Query Editor v2
2. Connect to your Aurora cluster using master credentials
3. Execute the SQL from `create_schemas.sql`

## Creating Schemas

### Option 1: Using psql (Recommended)

If you have `psql` installed locally:

```bash
# Set environment variables
export PGHOST=<aurora-cluster-endpoint>
export PGDATABASE=trya
export PGUSER=postgres
export PGPASSWORD=<master-password>

# Execute the SQL script
psql -f create_schemas.sql
```

### Option 2: Using AWS Systems Manager Session Manager

If your Aurora cluster is in a private subnet:

1. Start a Session Manager session to an EC2 instance in the same VPC
2. Install PostgreSQL client:
   ```bash
   sudo yum install postgresql15 -y  # Amazon Linux 2023
   # or
   sudo apt-get install postgresql-client -y  # Ubuntu
   ```
3. Connect and create schemas:
   ```bash
   psql -h <aurora-cluster-endpoint> -U postgres -d trya -c "CREATE SCHEMA IF NOT EXISTS platform"
   ```

### Option 3: Using AWS RDS Query Editor (Easiest)

The Aurora cluster has Data API enabled, so you can use the Query Editor directly from the AWS Console:

1. Go to AWS Console → RDS → Query Editor v2
2. Click "Connect to database"
3. Select your Aurora cluster
4. Choose "Database username and password"
5. Enter:
   - Username: `postgres`
   - Password: (your master password from terragrunt.hcl)
   - Database: `trya`
6. Click "Connect"
7. Execute:
   ```sql
   CREATE SCHEMA IF NOT EXISTS platform;
   ```

### Option 4: Using DBeaver or pgAdmin

1. Connect to your Aurora cluster using your preferred GUI tool
2. Open a SQL editor
3. Execute the `create_schemas.sql` script

## Required Schemas

Based on the `additional_schemas` variable in your terragrunt.hcl:

- `platform` - Schema for platform-specific tables and objects

## Verification

To verify schemas were created successfully:

```sql
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');
```

Expected output:
```
 schema_name 
-------------
 public
 platform
```

## Permissions

After creating schemas, you may need to grant permissions to application users:

```sql
-- Grant all privileges on the schema
GRANT ALL PRIVILEGES ON SCHEMA platform TO your_app_user;

-- Grant privileges on existing objects
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA platform TO your_app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA platform TO your_app_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA platform 
  GRANT ALL ON TABLES TO your_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA platform 
  GRANT ALL ON SEQUENCES TO your_app_user;
```

## Automation

If you need to automate schema creation, consider:

1. **AWS Lambda**: Create a Lambda function that runs after Aurora provisioning
2. **CI/CD Pipeline**: Add a step in your deployment pipeline to execute the SQL script
3. **Terraform PostgreSQL Provider**: Use the `postgresql` provider (requires network connectivity)
4. **Database Migration Tool**: Use tools like Flyway or Liquibase for schema management
