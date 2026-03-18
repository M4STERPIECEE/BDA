CREATE OR REPLACE FUNCTION fn_recalculate_average()
RETURNS TRIGGER AS $$
DECLARE
v_student_id INTEGER;
BEGIN
    v_student_id := COALESCE(NEW.student_id, OLD.student_id);

UPDATE student
SET average = (
    SELECT COALESCE(
                   SUM(g.value * s.coefficient) / NULLIF(SUM(s.coefficient), 0),
                   0
           )
    FROM  grade   g
              JOIN  subject s ON s.subject_id = g.subject_id
    WHERE g.student_id = v_student_id
)
WHERE student_id = v_student_id;

RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_average
    AFTER INSERT OR UPDATE OR DELETE ON grade
    FOR EACH ROW
    EXECUTE FUNCTION fn_recalculate_average();

CREATE OR REPLACE FUNCTION fn_audit_grade()
RETURNS TRIGGER AS $$
DECLARE
v_student_name  VARCHAR(100);
    v_subject_label VARCHAR(100);
BEGIN

    IF TG_OP = 'INSERT' THEN

SELECT st.full_name, sb.label
INTO   v_student_name, v_subject_label
FROM   student st
           JOIN   subject sb ON sb.subject_id = NEW.subject_id
WHERE  st.student_id = NEW.student_id;

INSERT INTO grade_audit (
    operation_type, student_id, student_name,
    subject_label,  old_value,  new_value
)
VALUES (
           'INSERT', NEW.student_id, v_student_name,
           v_subject_label, NULL, NEW.value
       );

ELSIF TG_OP = 'UPDATE' THEN

SELECT st.full_name, sb.label
INTO   v_student_name, v_subject_label
FROM   student st
           JOIN   subject sb ON sb.subject_id = NEW.subject_id
WHERE  st.student_id = NEW.student_id;

INSERT INTO grade_audit (
    operation_type, student_id, student_name,
    subject_label,  old_value,  new_value
)
VALUES (
           'UPDATE', NEW.student_id, v_student_name,
           v_subject_label, OLD.value, NEW.value
       );

ELSIF TG_OP = 'DELETE' THEN

SELECT st.full_name, sb.label
INTO   v_student_name, v_subject_label
FROM   student st
           JOIN   subject sb ON sb.subject_id = OLD.subject_id
WHERE  st.student_id = OLD.student_id;

INSERT INTO grade_audit (
    operation_type, student_id, student_name,
    subject_label,  old_value,  new_value
)
VALUES (
           'DELETE', OLD.student_id, v_student_name,
           v_subject_label, OLD.value, NULL
       );

END IF;

RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_grade
    AFTER INSERT OR UPDATE OR DELETE ON grade
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_grade();