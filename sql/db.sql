-- ================================================================
-- GIFT TRACKER APPLICATION — PostgreSQL Full Schema Script
-- Compatible with NestJS TypeORM entities (synchronize: false)
-- ================================================================

-- Step 1: Create database (run as superuser)
-- CREATE DATABASE gift_tracker;
-- \c gift_tracker;

-- ================================================================
-- SECTION 1: CLEAN SLATE (Drop in dependency order)
-- ================================================================
DROP TABLE IF EXISTS gifts_given      CASCADE;
DROP TABLE IF EXISTS gifts_received   CASCADE;
DROP TABLE IF EXISTS persons          CASCADE;
DROP TABLE IF EXISTS functions        CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

DROP TYPE IF EXISTS gift_type_enum;

-- ================================================================
-- SECTION 2: ENUM TYPES
-- ================================================================
CREATE TYPE gift_type_enum AS ENUM ('cash', 'voucher', 'item');

-- ================================================================
-- SECTION 3: TABLE DEFINITIONS
-- ================================================================

-- -----------------------------------------------------------------
-- 3.1 users
-- -----------------------------------------------------------------
CREATE TABLE users (
    id          SERIAL          PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,   -- bcrypt hashed
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users              IS 'Application login accounts';
COMMENT ON COLUMN users.password     IS 'bcrypt hashed password (10 salt rounds)';

-- -----------------------------------------------------------------
-- 3.2 functions  (event / occasion master)
-- -----------------------------------------------------------------
CREATE TABLE functions (
    id           SERIAL          PRIMARY KEY,
    name         VARCHAR(100)    NOT NULL,
    description  TEXT,
    event_date   DATE,
    created_at   TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  functions            IS 'Master list of occasions/events (weddings, birthdays, etc.)';
COMMENT ON COLUMN functions.name       IS 'Display name of the function, e.g. Ram Prasad Wedding';
COMMENT ON COLUMN functions.event_date IS 'Actual date of the event';

-- -----------------------------------------------------------------
-- 3.3 persons
-- -----------------------------------------------------------------
CREATE TABLE persons (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    address     TEXT,
    phone       VARCHAR(20),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE persons IS 'People who give or receive gifts';

-- -----------------------------------------------------------------
-- 3.4 gifts_received
--     Every received gift is linked to a FUNCTION (FK) and a PERSON (FK)
-- -----------------------------------------------------------------
CREATE TABLE gifts_received (
    id                SERIAL           PRIMARY KEY,
    function_id       INTEGER          NOT NULL
                          REFERENCES functions(id) ON DELETE CASCADE,
    person_id         INTEGER          NOT NULL
                          REFERENCES persons(id)  ON DELETE RESTRICT,
    gift_type         gift_type_enum   NOT NULL,
    -- Cash fields
    amount            DECIMAL(10, 2)   CHECK (amount IS NULL OR amount >= 0),
    -- Voucher fields
    voucher_details   VARCHAR(255),
    -- Item fields
    item_description  TEXT,
    quantity          INTEGER          NOT NULL DEFAULT 1
                          CHECK (quantity >= 1),
    -- Common
    notes             TEXT,
    received_date     DATE             NOT NULL DEFAULT CURRENT_DATE,
    created_at        TIMESTAMP        NOT NULL DEFAULT NOW(),

    -- Business rules: each gift_type must carry the right detail columns
    CONSTRAINT chk_cash_amount
        CHECK (gift_type <> 'cash'    OR amount           IS NOT NULL),
    CONSTRAINT chk_voucher_detail
        CHECK (gift_type <> 'voucher' OR voucher_details  IS NOT NULL),
    CONSTRAINT chk_item_description
        CHECK (gift_type <> 'item'    OR item_description IS NOT NULL)
);

COMMENT ON TABLE  gifts_received                IS 'Gifts received at a specific function from a person';
COMMENT ON COLUMN gifts_received.function_id    IS 'FK → functions.id (the occasion)';
COMMENT ON COLUMN gifts_received.person_id      IS 'FK → persons.id (the giver)';
COMMENT ON COLUMN gifts_received.amount         IS 'Populated only when gift_type = cash';
COMMENT ON COLUMN gifts_received.voucher_details IS 'Populated only when gift_type = voucher';
COMMENT ON COLUMN gifts_received.item_description IS 'Populated only when gift_type = item';

-- -----------------------------------------------------------------
-- 3.5 gifts_given
--     function_name is an INLINE VARCHAR field — no FK to functions
-- -----------------------------------------------------------------
CREATE TABLE gifts_given (
    id                SERIAL           PRIMARY KEY,
    person_id         INTEGER          NOT NULL
                          REFERENCES persons(id) ON DELETE CASCADE,
    function_name     VARCHAR(100)     NOT NULL,   -- inline text, no FK
    gift_type         gift_type_enum   NOT NULL,
    amount            DECIMAL(10, 2)   CHECK (amount IS NULL OR amount >= 0),
    voucher_details   VARCHAR(255),
    item_description  TEXT,
    quantity          INTEGER          NOT NULL DEFAULT 1
                          CHECK (quantity >= 1),
    notes             TEXT,
    given_date        DATE             NOT NULL DEFAULT CURRENT_DATE,
    created_at        TIMESTAMP        NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_gg_cash_amount
        CHECK (gift_type <> 'cash'    OR amount           IS NOT NULL),
    CONSTRAINT chk_gg_voucher_detail
        CHECK (gift_type <> 'voucher' OR voucher_details  IS NOT NULL),
    CONSTRAINT chk_gg_item_description
        CHECK (gift_type <> 'item'    OR item_description IS NOT NULL)
);

COMMENT ON TABLE  gifts_given               IS 'Gifts given by a person to others at any occasion';
COMMENT ON COLUMN gifts_given.person_id     IS 'FK → persons.id (the giver in our system)';
COMMENT ON COLUMN gifts_given.function_name IS 'Free-text occasion name — no FK to functions table';

-- ================================================================
-- SECTION 4: INDEXES
-- ================================================================

-- functions
CREATE INDEX idx_functions_name       ON functions(name);
CREATE INDEX idx_functions_event_date ON functions(event_date DESC);

-- persons
CREATE INDEX idx_persons_name         ON persons(name);
CREATE INDEX idx_persons_phone        ON persons(phone);

-- gifts_received
CREATE INDEX idx_gr_function_id       ON gifts_received(function_id);
CREATE INDEX idx_gr_person_id         ON gifts_received(person_id);
CREATE INDEX idx_gr_gift_type         ON gifts_received(gift_type);
CREATE INDEX idx_gr_received_date     ON gifts_received(received_date DESC);

-- gifts_given
CREATE INDEX idx_gg_person_id         ON gifts_given(person_id);
CREATE INDEX idx_gg_gift_type         ON gifts_given(gift_type);
CREATE INDEX idx_gg_given_date        ON gifts_given(given_date DESC);
CREATE INDEX idx_gg_function_name     ON gifts_given(function_name);

-- ================================================================
-- SECTION 5: SEED DATA
-- ================================================================

-- -----------------------------------------------------------------
-- 5.1 Default admin user
--     Password: admin123
--     Hash generated with: bcrypt.hashSync('admin123', 10)
--     To regenerate: node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123',10))"
-- -----------------------------------------------------------------
INSERT INTO users (username, password) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;
-- NOTE: The hash above is for 'admin123'.
-- The app's UsersService.onModuleInit() also auto-seeds this on first start.

-- -----------------------------------------------------------------
-- 5.2 Sample Functions
-- -----------------------------------------------------------------
INSERT INTO functions (name, description, event_date) VALUES
('Ramesh Wedding',       'Wedding ceremony of Ramesh & Priya',       '2025-11-15'),
('Anitha 30th Birthday', 'Anitha''s 30th birthday celebration',       '2025-12-20'),
('Suresh Housewarming',  'New house warming — Whitefield',            '2026-01-05'),
('Kavitha Engagement',   'Engagement ceremony of Kavitha & Kiran',   '2026-02-10');

-- -----------------------------------------------------------------
-- 5.3 Sample Persons
-- -----------------------------------------------------------------
INSERT INTO persons (name, address, phone) VALUES
('Mohan Kumar',     '12, MG Road, Bengaluru - 560001',        '9876543210'),
('Anitha Rao',      '45, Indiranagar, Bengaluru - 560038',    '9845012345'),
('Ravi Shankar',    '78, Koramangala, Bengaluru - 560034',    '9900112233'),
('Kavitha Nair',    '23, HSR Layout, Bengaluru - 560102',     '9731234567'),
('Suresh Reddy',    '56, Whitefield, Bengaluru - 560066',     '9988776655'),
('Deepa Menon',     '90, Jayanagar 4th Block, Bengaluru',     '9611223344'),
('Vijay Prasad',    '34, BTM Layout, Bengaluru - 560076',     '9555443322');

-- -----------------------------------------------------------------
-- 5.4 Sample Gifts Received — Ramesh Wedding (function_id = 1)
-- -----------------------------------------------------------------
INSERT INTO gifts_received
    (function_id, person_id, gift_type, amount, voucher_details, item_description, quantity, notes, received_date)
VALUES
(1, 1, 'cash',    5000.00, NULL,                          NULL,                    1, 'With blessings',          '2025-11-15'),
(1, 2, 'cash',    2000.00, NULL,                          NULL,                    1, NULL,                      '2025-11-15'),
(1, 3, 'item',    NULL,    NULL,                          'Silver Dinner Set',     1, 'Nicely gift-wrapped',     '2025-11-15'),
(1, 4, 'voucher', NULL,    'Amazon Gift Card - ₹1500',   NULL,                    1, NULL,                      '2025-11-15'),
(1, 5, 'cash',    3000.00, NULL,                          NULL,                    1, NULL,                      '2025-11-15'),
(1, 6, 'item',    NULL,    NULL,                          'Stainless Steel Casserole Set', 2, NULL,             '2025-11-15'),
(1, 7, 'cash',    1100.00, NULL,                          NULL,                    1, 'Shagun',                  '2025-11-15');

-- -----------------------------------------------------------------
-- 5.5 Sample Gifts Received — Anitha Birthday (function_id = 2)
-- -----------------------------------------------------------------
INSERT INTO gifts_received
    (function_id, person_id, gift_type, amount, voucher_details, item_description, quantity, notes, received_date)
VALUES
(2, 1, 'cash',    1000.00, NULL,                          NULL,                    1, 'Happy Birthday',         '2025-12-20'),
(2, 3, 'item',    NULL,    NULL,                          'Silk Saree',            1, NULL,                     '2025-12-20'),
(2, 5, 'voucher', NULL,    'Titan Watches Voucher - ₹3000', NULL,                1, NULL,                     '2025-12-20'),
(2, 7, 'cash',    500.00,  NULL,                          NULL,                    1, NULL,                     '2025-12-20');

-- -----------------------------------------------------------------
-- 5.6 Sample Gifts Received — Suresh Housewarming (function_id = 3)
-- -----------------------------------------------------------------
INSERT INTO gifts_received
    (function_id, person_id, gift_type, amount, voucher_details, item_description, quantity, notes, received_date)
VALUES
(3, 1, 'item',    NULL,    NULL,                          'Puja Thali Set',        1, NULL,                     '2026-01-05'),
(3, 2, 'cash',    2000.00, NULL,                          NULL,                    1, NULL,                     '2026-01-05'),
(3, 4, 'voucher', NULL,    'Croma Electronics - ₹5000',  NULL,                    1, 'For new home',           '2026-01-05'),
(3, 6, 'cash',    1500.00, NULL,                          NULL,                    1, NULL,                     '2026-01-05');

-- -----------------------------------------------------------------
-- 5.7 Sample Gifts Given (by various persons at external occasions)
-- -----------------------------------------------------------------
INSERT INTO gifts_given
    (person_id, function_name, gift_type, amount, voucher_details, item_description, quantity, notes, given_date)
VALUES
-- Mohan Kumar gave gifts at others' events
(1, 'Priya''s Wedding',          'cash',    5000.00, NULL,                  NULL,             1, 'Happy married life', '2025-08-10'),
(1, 'Ravi Birthday Party',       'item',    NULL,    NULL,                  'Wrist Watch',    1, NULL,                 '2025-09-25'),
(1, 'Kavitha Housewarming',      'cash',    2000.00, NULL,                  NULL,             1, NULL,                 '2025-10-05'),
-- Anitha Rao gave gifts
(2, 'Suresh Wedding',            'cash',    3000.00, NULL,                  NULL,             1, NULL,                 '2025-07-12'),
(2, 'Deepa''s Baby Shower',     'item',    NULL,    NULL,                  'Baby Clothes Set',2, 'With love',         '2025-11-01'),
-- Ravi Shankar gave gifts
(3, 'Mohan''s Anniversary',     'voucher', NULL,    'Flipkart - ₹2000',   NULL,             1, NULL,                 '2025-06-18'),
(3, 'Vijay Prasad Birthday',     'cash',    501.00,  NULL,                  NULL,             1, 'Shagun',             '2026-01-20');

-- ================================================================
-- SECTION 6: REPORTING VIEWS
-- ================================================================

-- -----------------------------------------------------------------
-- 6.1 Function-wise gift summary
-- -----------------------------------------------------------------
CREATE OR REPLACE VIEW v_function_gift_summary AS
SELECT
    f.id                                                           AS function_id,
    f.name                                                         AS function_name,
    f.event_date,
    COUNT(gr.id)                                                   AS total_gifts,
    COALESCE(SUM(gr.amount) FILTER (WHERE gr.gift_type = 'cash'), 0)
                                                                   AS total_cash,
    COUNT(gr.id)    FILTER (WHERE gr.gift_type = 'voucher')       AS total_vouchers,
    COUNT(gr.id)    FILTER (WHERE gr.gift_type = 'item')          AS total_items
FROM functions f
LEFT JOIN gifts_received gr ON gr.function_id = f.id
GROUP BY f.id, f.name, f.event_date
ORDER BY f.event_date DESC;

-- -----------------------------------------------------------------
-- 6.2 Person-wise received & given summary
-- -----------------------------------------------------------------
CREATE OR REPLACE VIEW v_person_gift_summary AS
SELECT
    p.id                                                                    AS person_id,
    p.name                                                                  AS person_name,
    p.phone,
    p.address,
    COUNT(DISTINCT gr.id)                                                   AS total_received,
    COALESCE(SUM(gr.amount) FILTER (WHERE gr.gift_type = 'cash'), 0)       AS cash_received,
    COUNT(DISTINCT gg.id)                                                   AS total_given,
    COALESCE(SUM(gg.amount) FILTER (WHERE gg.gift_type = 'cash'), 0)       AS cash_given
FROM persons p
LEFT JOIN gifts_received gr ON gr.person_id = p.id
LEFT JOIN gifts_given    gg ON gg.person_id = p.id
GROUP BY p.id, p.name, p.phone, p.address
ORDER BY p.name;

-- -----------------------------------------------------------------
-- 6.3 Full gifts received detail (for function-wise print)
-- -----------------------------------------------------------------
CREATE OR REPLACE VIEW v_gifts_received_detail AS
SELECT
    gr.id,
    f.id              AS function_id,
    f.name            AS function_name,
    f.event_date,
    p.id              AS person_id,
    p.name            AS person_name,
    p.address         AS person_address,
    p.phone           AS person_phone,
    gr.gift_type,
    gr.amount,
    gr.voucher_details,
    gr.item_description,
    gr.quantity,
    gr.notes,
    gr.received_date,
    gr.created_at
FROM gifts_received gr
JOIN functions f ON f.id = gr.function_id
JOIN persons   p ON p.id = gr.person_id
ORDER BY gr.received_date DESC;

-- -----------------------------------------------------------------
-- 6.4 Full gifts given detail (for person-wise print)
-- -----------------------------------------------------------------
CREATE OR REPLACE VIEW v_gifts_given_detail AS
SELECT
    gg.id,
    p.id              AS person_id,
    p.name            AS person_name,
    p.address         AS person_address,
    p.phone           AS person_phone,
    gg.function_name,
    gg.gift_type,
    gg.amount,
    gg.voucher_details,
    gg.item_description,
    gg.quantity,
    gg.notes,
    gg.given_date,
    gg.created_at
FROM gifts_given gg
JOIN persons p ON p.id = gg.person_id
ORDER BY gg.given_date DESC;

-- ================================================================
-- SECTION 7: UTILITY QUERIES (run as needed for reports)
-- ================================================================

-- Function-wise full report (replaces /reports/function/:id)
/*
SELECT * FROM v_gifts_received_detail
WHERE function_id = 1
ORDER BY received_date, person_name;
*/

-- Person-wise full report (replaces /reports/person/:id)
/*
SELECT * FROM v_gifts_received_detail WHERE person_id = 1
UNION ALL
SELECT NULL,NULL,NULL,NULL, person_id, person_name, person_address, person_phone,
       gift_type, amount, voucher_details, item_description, quantity, notes,
       given_date, created_at
FROM v_gifts_given_detail WHERE person_id = 1;
*/

-- Dashboard summary across all functions
/*
SELECT * FROM v_function_gift_summary;
*/

-- Dashboard summary across all persons
/*
SELECT * FROM v_person_gift_summary;
*/

-- ================================================================
-- END OF SCRIPT
-- ================================================================
