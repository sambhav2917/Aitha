-- Create database
CREATE DATABASE master_data_db;


-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('PAID POC', 'LICENSED', 'ENTERPRISE')),
    address_line1 TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    primary_contact_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) NOT NULL UNIQUE,
    mobile_phone VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Non-Active')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    license_key VARCHAR(100) UNIQUE NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_end_date ON companies(end_date);
CREATE INDEX idx_companies_business_email ON companies(business_email);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_licenses_company_id ON licenses(company_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for companies table
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO companies (company_name, company_code, account_type, address_line1, city, state_province, country, primary_contact_name, business_email, mobile_phone, user_id, start_date, end_date, status) VALUES
('Nexus Dynamics Ltd', 'TECH01', 'PAID POC', '123 Tech Street', 'San Francisco', 'California', 'USA', 'Sarah Jenkins', 'sarah@nexusdynamics.com', '+1 415-555-0123', 'NX-90432', '2024-01-12', '2025-01-12', 'Active'),
('Vertex Solutions', 'TECH02', 'LICENSED', '456 Business Ave', 'Toronto', 'Ontario', 'Canada', 'Marc-André L.', 'marc@vertexsolutions.com', '+1 613-555-0199', 'VX-11822', '2023-03-05', '2024-03-05', 'Non-Active'),
('Global Reach Corp', 'TECH03', 'ENTERPRISE', '789 Harbor Drive', 'Sydney', 'NSW', 'Australia', 'David Chen', 'david@globalreach.com', '+61 2-5550-1234', 'GR-77301', '2023-08-20', '2026-08-20', 'Active');