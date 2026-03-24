INSERT INTO app_user (username, password, role) VALUES
                                                    ('MASTERPIECE', 'zntPEGASUS77K', 'ADMIN'),
                                                    ('COMEBACK', 'POULET123', 'USER')
ON CONFLICT (username) DO NOTHING;
