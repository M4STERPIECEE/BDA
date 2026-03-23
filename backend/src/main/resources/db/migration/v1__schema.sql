CREATE TABLE student (
                         student_id  SERIAL PRIMARY KEY,
                         full_name   VARCHAR(100) NOT NULL,
                         average     NUMERIC(5,2) DEFAULT 0 CHECK (average >= 0 AND average <= 20)
);

CREATE TABLE subject (
                         subject_id   SERIAL PRIMARY KEY,
                         label        VARCHAR(100) NOT NULL,
                         coefficient  NUMERIC(4,2) NOT NULL CHECK (coefficient > 0)
);

CREATE TABLE grade (
                       student_id  INTEGER NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
                       subject_id  INTEGER NOT NULL REFERENCES subject(subject_id) ON DELETE CASCADE,
                       value       NUMERIC(4,2) NOT NULL CHECK (value >= 0 AND value <= 20),
                       PRIMARY KEY (student_id, subject_id)
);
CREATE TABLE grade_audit (
                             audit_id        SERIAL PRIMARY KEY,
                             operation_type  VARCHAR(10)  NOT NULL CHECK (operation_type IN ('INSERT','UPDATE','DELETE')),
                             updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
                             student_id      INTEGER,
                             student_name    VARCHAR(100),
                             subject_label   VARCHAR(100),
                             old_value       NUMERIC(4,2),
                             new_value       NUMERIC(4,2),
                             db_user         VARCHAR(100) NOT NULL DEFAULT CURRENT_USER
);

CREATE TABLE app_user (
                          user_id     SERIAL PRIMARY KEY,
                          username    VARCHAR(50)  NOT NULL UNIQUE,
                          password    VARCHAR(255) NOT NULL,          -- BCrypt hash
                          role        VARCHAR(20)  NOT NULL DEFAULT 'USER'
                              CHECK (role IN ('ADMIN','USER')),
                          enabled     BOOLEAN      NOT NULL DEFAULT TRUE
);