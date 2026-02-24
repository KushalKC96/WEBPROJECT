hardware-- Create database
CREATE DATABASE IF NOT EXISTS hardware_hub;
USE hardware_hub;

-- ============================================
-- USERS & AUTHENTICATION TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  reset_token VARCHAR(255),
  reset_token_expire DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- Sessions table (for session-based authentication)
CREATE TABLE IF NOT EXISTS sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_token (session_token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



----------------------------------------------------------------------------------------------------------------------------------------------
-- ============================================
-- HARDWARE & PRODUCTS TABLES
-- ============================================

-- Hardware/Tools/Products table
CREATE TABLE hardware (
  hardware_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  rental_price_per_day DECIMAL(10,2),
  stock_quantity INT DEFAULT 0,
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- PROFESSIONALS TABLE
-- ============================================

-- Professionals/Service Providers table
CREATE TABLE professional (
  professional_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  skill VARCHAR(100) NOT NULL,
  experience_years INT,
  hourly_rate DECIMAL(10,2),
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_skill (skill),
  INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- PAYMENT TABLE
-- ============================================

-- Payment table (must be created before rental and booking)
CREATE TABLE payment (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) DEFAULT 'cash',
  status VARCHAR(30) DEFAULT 'pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_id VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- RENTAL TABLE
-- ============================================

-- Rental table (for renting hardware/tools)
CREATE TABLE rental (
  rental_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hardware_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  return_date DATE,
  total_amount DECIMAL(10,2),
  status VARCHAR(30) DEFAULT 'active',
  payment_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hardware_id) REFERENCES hardware(hardware_id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_hardware_id (hardware_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- BOOKING TABLE
-- ============================================

-- Booking table (for hiring professionals)
CREATE TABLE booking (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  professional_id INT NOT NULL,
  booking_date DATE NOT NULL,
  service_hours INT,
  total_amount DECIMAL(10,2),
  status VARCHAR(30) DEFAULT 'pending',
  payment_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_id) REFERENCES professional(professional_id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_professional_id (professional_id),
  INDEX idx_status (status),
  INDEX idx_booking_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample hardware
INSERT INTO hardware (name, category, description, price, rental_price_per_day, stock_quantity) VALUES
('Electric Drill', 'Power Tools', 'Professional grade electric drill', 89.99, 15.00, 10),
('Circular Saw', 'Power Tools', 'Heavy duty circular saw', 129.99, 20.00, 8),
('Hammer', 'Hand Tools', 'Steel claw hammer', 19.99, 3.00, 25),
('Wrench Set', 'Hand Tools', 'Complete wrench set', 49.99, 8.00, 15),
('Ladder 6ft', 'Equipment', 'Aluminum extension ladder', 159.99, 25.00, 5);

-- Insert sample professionals
INSERT INTO professional (skill, experience_years, hourly_rate, bio) VALUES
('Electrician', 10, 75.00, 'Licensed electrician with 10 years experience'),
('Plumber', 8, 65.00, 'Certified plumber specializing in residential work'),
('Carpenter', 15, 80.00, 'Master carpenter for custom woodwork'),
('Painter', 5, 50.00, 'Professional painter for interior and exterior'),
('HVAC Technician', 12, 85.00, 'Heating and cooling system expert');

-- Note: Users will be created through the registration API

----------------------------------------------------------------------------------------------------------------------------------------------

show tables;
select * from users;
select * from sessions;
select * from hardware;
select * from professional;
select * from payment;
select * from rental;
select * from booking;
