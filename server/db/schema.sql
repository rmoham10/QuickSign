CREATE DATABASE IF NOT EXISTS befit_db;
USE befit_db;

CREATE TABLE users (
  id            CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  full_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL UNIQUE,   -- one phone = one account
  phone_verified TINYINT(1)   NOT NULL DEFAULT 0,
  tier          VARCHAR(20)   NOT NULL DEFAULT 'free',
  created_at    DATETIME      NOT NULL DEFAULT NOW(),
  updated_at    DATETIME      NOT NULL DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE phone_verifications (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  phone       VARCHAR(20)   NOT NULL,
  otp_code    VARCHAR(6)    NOT NULL,
  expires_at  DATETIME      NOT NULL,
  used        TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT NOW(),
  INDEX idx_phone (phone)
);