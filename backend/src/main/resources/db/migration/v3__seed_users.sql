INSERT INTO app_user (username, password, role) VALUES
                                                    ('MASTERPIECE', 'zntPEGASUS77K', 'ADMIN'),
                                                    ('COMEBACK', ' ', 'USER')
ON CONFLICT (username) DO NOTHING;
