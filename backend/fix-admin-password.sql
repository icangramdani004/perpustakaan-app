-- Quick Reset Admin Password
-- Run this if you forgot admin password

UPDATE perpustakaan.users 
SET password = '$2a$05$iVMFQsZK0YqW4Z0dIKfLju5x/WLh8/oIWr.H0yOp3Z2z0r8DqCPYW'
WHERE username = 'admin';

-- This hash is for password: admin123
-- Generated with bcryptjs salt rounds: 5

-- Verify:
SELECT id, username, password FROM perpustakaan.users WHERE username = 'admin';
