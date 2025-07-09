DROP TABLE IF EXISTS notification, review_item, study_log, course_invitation, course_join_request, course_member, topic, discipline, course, study_plan, app_user CASCADE;
DROP TYPE IF EXISTS user_role_enum, request_status_enum, invitation_status_enum, activity_type_enum, review_item_status_enum;

CREATE TYPE user_role_enum AS ENUM ('student', 'teacher_coordinator', 'admin');
CREATE TYPE request_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE invitation_status_enum AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE activity_type_enum AS ENUM ('study_session', 'exercise_practice', 'review', 'other');
CREATE TYPE review_item_status_enum AS ENUM ('pending', 'completed', 'snoozed', 'archived');


CREATE TABLE app_user (
    usr_id SERIAL PRIMARY KEY,
    usr_student_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    usr_first_name VARCHAR(255) NOT NULL,
    usr_last_name VARCHAR(255) NOT NULL,
    usr_email VARCHAR(255) NOT NULL UNIQUE,
    usr_password_hash TEXT NOT NULL,
    usr_role user_role_enum NOT NULL,
    usr_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    usr_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    usr_deleted_at TIMESTAMPTZ NULL
);
COMMENT ON TABLE app_user IS 'Armazena informações dos usuários do sistema (RF02)';
COMMENT ON COLUMN app_user.usr_student_id IS 'ID público do usuário, para ser usado em URLs e APIs de forma segura.';

CREATE TABLE study_plan (
    spl_id SERIAL PRIMARY KEY,
    spl_fk_usr_id_created_by INTEGER NOT NULL REFERENCES app_user(usr_id),
    spl_name VARCHAR(255) NOT NULL,
    spl_description TEXT NULL,
    spl_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    spl_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE study_plan IS 'Armazena os planos de estudo (RF06), que podem ser pessoais de um aluno ou o plano principal de uma turma.';

CREATE TABLE course (
    crs_id SERIAL PRIMARY KEY,
    crs_fk_usr_id_created_by INTEGER NOT NULL REFERENCES app_user(usr_id),
    crs_fk_spl_id_main_plan INTEGER NOT NULL REFERENCES study_plan(spl_id) UNIQUE,
    crs_name VARCHAR(255) NOT NULL,
    crs_description TEXT NULL,
    crs_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    crs_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    crs_deleted_at TIMESTAMPTZ NULL
);
COMMENT ON TABLE course IS 'Armazena informações sobre as turmas (RF04) criadas por professores/coordenadores.';

CREATE TABLE discipline (
    dcp_id SERIAL PRIMARY KEY,
    dcp_fk_spl_id INTEGER NOT NULL REFERENCES study_plan(spl_id) ON DELETE CASCADE,
    dcp_name VARCHAR(255) NOT NULL,
    dcp_description TEXT NULL,
    dcp_order INTEGER NULL,
    dcp_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dcp_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE discipline IS 'Armazena as disciplinas ou componentes dentro de um plano de estudo (RF06.3).';

CREATE TABLE topic (
    tpc_id SERIAL PRIMARY KEY,
    tpc_fk_dcp_id INTEGER NOT NULL REFERENCES discipline(dcp_id) ON DELETE CASCADE,
    tpc_name VARCHAR(255) NOT NULL,
    tpc_description TEXT NULL,
    tpc_order INTEGER NULL,
    tpc_estimated_study_time_minutes INTEGER NULL,
    tpc_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tpc_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE topic IS 'Armazena os tópicos, aulas ou capítulos dentro de uma disciplina (RF06.3).';


CREATE TABLE course_member (
    csm_fk_usr_id INTEGER NOT NULL REFERENCES app_user(usr_id) ON DELETE CASCADE,
    csm_fk_crs_id INTEGER NOT NULL REFERENCES course(crs_id) ON DELETE CASCADE,
    csm_joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (csm_fk_usr_id, csm_fk_crs_id)
);
COMMENT ON TABLE course_member IS 'Registra quais usuários (alunos) participam de quais turmas (RF05).';


CREATE TABLE course_join_request (
    cjr_id SERIAL PRIMARY KEY,
    cjr_fk_usr_id INTEGER NOT NULL REFERENCES app_user(usr_id) ON DELETE CASCADE,
    cjr_fk_crs_id INTEGER NOT NULL REFERENCES course(crs_id) ON DELETE CASCADE,
    cjr_status request_status_enum NOT NULL DEFAULT 'pending',
    cjr_requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cjr_resolved_at TIMESTAMPTZ NULL,
    cjr_fk_usr_id_resolved_by INTEGER NULL REFERENCES app_user(usr_id)
);
COMMENT ON TABLE course_join_request IS 'Registra as solicitações de alunos para entrar em turmas (RF05.2).';
CREATE UNIQUE INDEX idx_unique_pending_join_request ON course_join_request (cjr_fk_usr_id, cjr_fk_crs_id) WHERE cjr_status = 'pending';

CREATE TABLE course_invitation (
    civ_id SERIAL PRIMARY KEY,
    civ_fk_usr_id_invited INTEGER NOT NULL REFERENCES app_user(usr_id) ON DELETE CASCADE,
    civ_fk_crs_id INTEGER NOT NULL REFERENCES course(crs_id) ON DELETE CASCADE,
    civ_fk_usr_id_invited_by INTEGER NOT NULL REFERENCES app_user(usr_id),
    civ_status invitation_status_enum NOT NULL DEFAULT 'pending',
    civ_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    civ_resolved_at TIMESTAMPTZ NULL
);
COMMENT ON TABLE course_invitation IS 'Registra os convites enviados por professores para alunos (RF05.4).';
CREATE UNIQUE INDEX idx_unique_pending_invitation ON course_invitation (civ_fk_usr_id_invited, civ_fk_crs_id) WHERE civ_status = 'pending';

CREATE TABLE study_log (
    slg_id SERIAL PRIMARY KEY,
    slg_fk_usr_id INTEGER NOT NULL REFERENCES app_user(usr_id),
    slg_fk_spl_id INTEGER NOT NULL REFERENCES study_plan(spl_id),
    slg_fk_dcp_id INTEGER NULL REFERENCES discipline(dcp_id),
    slg_fk_tpc_id INTEGER NULL REFERENCES topic(tpc_id),
    slg_activity_type activity_type_enum NOT NULL,
    slg_start_time TIMESTAMPTZ NOT NULL,
    slg_end_time TIMESTAMPTZ NULL,
    slg_duration_minutes INTEGER NOT NULL CHECK (slg_duration_minutes > 0),
    slg_items_attempted INTEGER NULL CHECK (slg_items_attempted >= 0),
    slg_items_correct INTEGER NULL CHECK (slg_items_correct >= 0 AND (slg_items_attempted IS NULL OR slg_items_correct <= slg_items_attempted)),
    slg_notes TEXT NULL,
    slg_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    slg_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE study_log IS 'Registra as sessões de estudo dos alunos (RF07).';

CREATE TABLE review_item (
    rvw_id SERIAL PRIMARY KEY,
    rvw_fk_usr_id INTEGER NOT NULL REFERENCES app_user(usr_id),
    rvw_fk_tpc_id INTEGER NOT NULL REFERENCES topic(tpc_id),
    rvw_fk_spl_id INTEGER NOT NULL REFERENCES study_plan(spl_id),
    rvw_next_review_date DATE NOT NULL,
    rvw_last_reviewed_at TIMESTAMPTZ NULL,
    rvw_current_interval_days INTEGER NULL,
    rvw_ease_factor NUMERIC(4,2) NULL,
    rvw_repetitions INTEGER NOT NULL DEFAULT 0,
    rvw_status review_item_status_enum NOT NULL DEFAULT 'pending',
    rvw_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rvw_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE review_item IS 'Armazena os itens (tópicos) que precisam ser revisados (RF08).';

CREATE TABLE notification (
    ntf_id SERIAL PRIMARY KEY,
    ntf_fk_usr_id INTEGER NOT NULL REFERENCES app_user(usr_id),
    ntf_type VARCHAR(100) NOT NULL,
    ntf_title VARCHAR(255) NOT NULL,
    ntf_message TEXT NOT NULL,
    ntf_link_to TEXT NULL,
    ntf_is_read BOOLEAN NOT NULL DEFAULT FALSE,
    ntf_read_at TIMESTAMPTZ NULL,
    ntf_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notification IS 'Armazena notificações para os usuários (RF13).';