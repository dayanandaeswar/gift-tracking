-- ================================================================
-- Gift Tracker — Complete Database Setup Script
-- PostgreSQL
-- Run as: psql -U postgres -d gift_tracker -f setup.sql
-- ================================================================

-- ── Drop existing tables (safe re-run) ──────────────────────────
DROP TABLE IF EXISTS gifts_given      CASCADE;
DROP TABLE IF EXISTS gifts_received   CASCADE;
DROP TABLE IF EXISTS persons          CASCADE;
DROP TABLE IF EXISTS functions        CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

-- ── Drop existing enum ───────────────────────────────────────────
DROP TYPE IF EXISTS gift_type_enum;

-- ================================================================
-- ENUMS
-- ================================================================

CREATE TYPE gift_type_enum AS ENUM ('cash', 'voucher', 'item');

-- ================================================================
-- TABLES
-- ================================================================

-- ── Users ────────────────────────────────────────────────────────
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Functions ────────────────────────────────────────────────────
CREATE TABLE functions (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  event_date  DATE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Persons ──────────────────────────────────────────────────────
CREATE TABLE persons (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  address    TEXT,
  phone      VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Gifts Received ───────────────────────────────────────────────
CREATE TABLE gifts_received (
  id               SERIAL PRIMARY KEY,
  function_id      INTEGER NOT NULL
                     REFERENCES functions(id) ON DELETE CASCADE,
  person_id        INTEGER NOT NULL
                     REFERENCES persons(id)   ON DELETE RESTRICT,
  gift_type        gift_type_enum NOT NULL,
  amount           NUMERIC(10, 2),
  voucher_details  TEXT,
  item_description TEXT,
  quantity         INTEGER NOT NULL DEFAULT 1,
  notes            TEXT,
  received_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Gifts Given ──────────────────────────────────────────────────
CREATE TABLE gifts_given (
  id               SERIAL PRIMARY KEY,
  person_id        INTEGER NOT NULL
                     REFERENCES persons(id) ON DELETE CASCADE,
  function_name    VARCHAR(200) NOT NULL,
  gift_type        gift_type_enum NOT NULL,
  amount           NUMERIC(10, 2),
  voucher_details  TEXT,
  item_description TEXT,
  quantity         INTEGER NOT NULL DEFAULT 1,
  notes            TEXT,
  given_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- INDEXES
-- ================================================================

CREATE INDEX idx_gifts_received_function  ON gifts_received(function_id);
CREATE INDEX idx_gifts_received_person    ON gifts_received(person_id);
CREATE INDEX idx_gifts_received_date      ON gifts_received(received_date);

CREATE INDEX idx_gifts_given_person       ON gifts_given(person_id);
CREATE INDEX idx_gifts_given_date         ON gifts_given(given_date);

CREATE INDEX idx_functions_event_date     ON functions(event_date);
CREATE INDEX idx_persons_name             ON persons(name);

-- ================================================================
-- SEED DATA
-- ================================================================

-- ── Admin user ───────────────────────────────────────────────────
-- Password: admin123  (bcrypt hash, cost=10)
-- Regenerate with: node -e "require('bcryptjs').hash('admin123',10).then(console.log)"
INSERT INTO users (username, password) VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);

-- ── Sample Functions ─────────────────────────────────────────────
INSERT INTO functions (name, description, event_date) VALUES
  ('Ramesh Wedding',
   'Wedding ceremony of Ramesh & Priya',
   '2025-11-15'),
  ('Suresh 60th Birthday',
   'Diamond jubilee birthday celebration',
   '2025-12-20'),
  ('Kavitha House Warming',
   'New house warming ceremony',
   '2026-01-10'),
  ('Anand & Meena Reception',
   'Wedding reception party',
   '2026-02-05');

-- ── Sample Persons ───────────────────────────────────────────────
INSERT INTO persons (name, address, phone) VALUES
  ('Mohan Kumar',      'No.12, Gandhi Street, Chennai - 600001',        '9876543210'),
  ('Anitha Ravi',      'No.45, Anna Nagar, Chennai - 600040',           '9845123456'),
  ('Suresh Babu',      'No.7, Velachery Main Road, Chennai - 600042',   '9900112233'),
  ('Priya Lakshmi',    'No.23, T.Nagar, Chennai - 600017',              '9988776655'),
  ('Karthik Selvam',   'No.89, Adyar, Chennai - 600020',                '9123456789'),
  ('Deepa Murugan',    'No.5, Tambaram, Chennai - 600045',              '9654321098'),
  ('Rajan Pillai',     'No.34, Mylapore, Chennai - 600004',             '9789012345'),
  ('Vijayalakshmi S',  'No.67, Porur, Chennai - 600116',                '9500123456'),
  ('Balaji Natarajan', 'No.11, Chromepet, Chennai - 600044',            '9444567890'),
  ('Saranya Devi',     'No.3, Pallavaram, Chennai - 600043',            '9345678901');

-- ── Gifts Received for Ramesh Wedding (function_id = 1) ──────────
INSERT INTO gifts_received
  (function_id, person_id, gift_type, amount, voucher_details,
   item_description, quantity, notes, received_date)
VALUES
  (1, 1,  'cash',    5000.00, NULL, NULL, 1,
   'Cash in envelope',           '2025-11-15'),
  (1, 2,  'cash',    3000.00, NULL, NULL, 1,
   NULL,                          '2025-11-15'),
  (1, 3,  'item',    NULL, NULL, 'Silver plate set',  2,
   'Gifted with blessings',       '2025-11-15'),
  (1, 4,  'cash',   10000.00, NULL, NULL, 1,
   'From relatives',              '2025-11-15'),
  (1, 5,  'voucher', NULL, 'Amazon Gift Card ₹2000', NULL, 1,
   NULL,                          '2025-11-15'),
  (1, 6,  'cash',    7500.00, NULL, NULL, 1,
   NULL,                          '2025-11-15'),
  (1, 7,  'item',    NULL, NULL, 'Stainless steel cookware set', 1,
   'Branded set',                 '2025-11-15'),
  (1, 8,  'cash',    2000.00, NULL, NULL, 1,
   NULL,                          '2025-11-15'),
  (1, 9,  'voucher', NULL, 'Tanishq Gold Voucher ₹5000', NULL, 1,
   'Premium gift',                '2025-11-15'),
  (1, 10, 'cash',    4000.00, NULL, NULL, 1,
   NULL,                          '2025-11-15');

-- ── Gifts Received for Suresh Birthday (function_id = 2) ─────────
INSERT INTO gifts_received
  (function_id, person_id, gift_type, amount, voucher_details,
   item_description, quantity, notes, received_date)
VALUES
  (2, 1,  'cash',    1001.00, NULL, NULL, 1,
   NULL,                          '2025-12-20'),
  (2, 3,  'item',    NULL, NULL, 'Silk dhoti set', 2,
   NULL,                          '2025-12-20'),
  (2, 4,  'cash',    5001.00, NULL, NULL, 1,
   'With blessings',              '2025-12-20'),
  (2, 6,  'voucher', NULL, 'Lifestyle ₹3000 Gift Card', NULL, 1,
   NULL,                          '2025-12-20'),
  (2, 7,  'cash',    2000.00, NULL, NULL, 1,
   NULL,                          '2025-12-20');

-- ── Gifts Received for House Warming (function_id = 3) ───────────
INSERT INTO gifts_received
  (function_id, person_id, gift_type, amount, voucher_details,
   item_description, quantity, notes, received_date)
VALUES
  (3, 2,  'item',    NULL, NULL, 'Ganesh idol brass',   1,
   'For new home',                '2026-01-10'),
  (3, 5,  'cash',   11000.00, NULL, NULL, 1,
   NULL,                          '2026-01-10'),
  (3, 8,  'item',    NULL, NULL, 'Wall clock',          1,
   NULL,                          '2026-01-10'),
  (3, 9,  'cash',    5000.00, NULL, NULL, 1,
   NULL,                          '2026-01-10'),
  (3, 10, 'voucher', NULL, 'IKEA Gift Voucher ₹4000', NULL, 1,
   NULL,                          '2026-01-10');

-- ── Gifts Received for Reception (function_id = 4) ───────────────
INSERT INTO gifts_received
  (function_id, person_id, gift_type, amount, voucher_details,
   item_description, quantity, notes, received_date)
VALUES
  (4, 1,  'cash',    7000.00, NULL, NULL, 1,
   NULL,                          '2026-02-05'),
  (4, 3,  'cash',    3000.00, NULL, NULL, 1,
   NULL,                          '2026-02-05'),
  (4, 4,  'item',    NULL, NULL, 'Bed sheet set',       2,
   'Premium cotton',              '2026-02-05'),
  (4, 5,  'cash',   15000.00, NULL, NULL, 1,
   'Close family',                '2026-02-05');

-- ── Gifts Given by various persons ───────────────────────────────
INSERT INTO gifts_given
  (person_id, function_name, gift_type, amount, voucher_details,
   item_description, quantity, notes, given_date)
VALUES
  (1, 'Kumar Family Wedding',
   'cash',    5000.00, NULL, NULL, 1,
   NULL,                          '2025-09-10'),
  (1, 'Neighbour House Warming',
   'item',    NULL, NULL, 'Steel utensil set', 1,
   NULL,                          '2025-10-05'),
  (2, 'Ravi Sister Wedding',
   'cash',    3000.00, NULL, NULL, 1,
   NULL,                          '2025-08-20'),
  (3, 'Office Colleague Wedding',
   'voucher', NULL, 'Amazon ₹2000', NULL, 1,
   NULL,                          '2025-11-01'),
  (4, 'Priya Brother Wedding',
   'cash',   10000.00, NULL, NULL, 1,
   'Close relative',              '2025-07-15'),
  (5, 'Karthik Friend Birthday',
   'item',    NULL, NULL, 'Shirt + Trouser set', 1,
   NULL,                          '2025-06-10'),
  (6, 'Deepa Cousin Wedding',
   'cash',    2000.00, NULL, NULL, 1,
   NULL,                          '2025-05-22'),
  (7, 'Rajan Nephew Naming Ceremony',
   'cash',    1001.00, NULL, NULL, 1,
   NULL,                          '2025-04-18'),
  (8, 'Vijaya Sister Reception',
   'cash',    5000.00, NULL, NULL, 1,
   NULL,                          '2025-03-30'),
  (9, 'Balaji House Warming',
   'voucher', NULL, 'Pepperfry ₹3000', NULL, 1,
   NULL,                          '2025-12-01'),
  (10, 'Saranya Friend Wedding',
   'cash',    4000.00, NULL, NULL, 1,
   NULL,                          '2026-01-20');

-- ================================================================
-- VERIFY
-- ================================================================

SELECT 'users'          AS tbl, COUNT(*) AS rows FROM users
UNION ALL
SELECT 'functions',              COUNT(*) FROM functions
UNION ALL
SELECT 'persons',                COUNT(*) FROM persons
UNION ALL
SELECT 'gifts_received',         COUNT(*) FROM gifts_received
UNION ALL
SELECT 'gifts_given',            COUNT(*) FROM gifts_given;
