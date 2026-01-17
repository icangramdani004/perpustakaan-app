-- Fix admin password to admin123
UPDATE users SET password = '$2b$05$qR0mqqqOllWaySGbTuy2BOBi8XI/X/opcf2DWHFdMC24hQJb0f/oO' WHERE id = 1;

-- Verify
SELECT id, username, password FROM users WHERE id = 1;
