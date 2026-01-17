-- Update demo user password to member123
UPDATE users SET password = '$2b$05$SxE.1XuhzO/H4r2okU34C.AzFDyqMEfWS4PU7X0wkNWm7VLvWBC6W' WHERE id = 2;

-- Verify
SELECT id, username, role FROM users WHERE id = 2;
