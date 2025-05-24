-- Criar tipos ENUM primeiro
CREATE TYPE user_role_enum AS ENUM ('student', 'teacher_coordinator', 'admin');
CREATE TYPE request_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE invitation_status_enum AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE activity_type_enum AS ENUM ('study_session', 'exercise_practice', 'review', 'other');
CREATE TYPE review_item_status_enum AS ENUM ('pending', 'completed', 'snoozed', 'archived');

-- Tabela user
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);



-- Tabela study_plan
CREATE TABLE study_plan (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by_user_id INTEGER NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela class
CREATE TABLE class (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by_user_id INTEGER NOT NULL REFERENCES "user"(id),
    main_study_plan_id INTEGER NOT NULL REFERENCES study_plan(id) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela discipline
CREATE TABLE discipline (
    id SERIAL PRIMARY KEY,
    study_plan_id INTEGER NOT NULL REFERENCES study_plan(id),
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    "order" INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela topic
CREATE TABLE topic (
    id SERIAL PRIMARY KEY,
    discipline_id INTEGER NOT NULL REFERENCES discipline(id),
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    "order" INTEGER NULL,
    estimated_study_time_minutes INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela class_member (relacionamento muitos-para-muitos)
CREATE TABLE class_member (
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    class_id INTEGER NOT NULL REFERENCES class(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, class_id)
);

-- Tabela class_join_request
CREATE TABLE class_join_request (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    class_id INTEGER NOT NULL REFERENCES class(id),
    status request_status_enum NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ NULL,
    resolved_by_user_id INTEGER NULL REFERENCES "user"(id)
);

-- Criar índice parcial para evitar solicitações duplicadas pendentes
CREATE UNIQUE INDEX idx_unique_pending_request ON class_join_request (user_id, class_id) 
WHERE status = 'pending';

-- Tabela class_invitation
CREATE TABLE class_invitation (
    id SERIAL PRIMARY KEY,
    invited_user_id INTEGER NOT NULL REFERENCES "user"(id),
    class_id INTEGER NOT NULL REFERENCES class(id),
    invited_by_user_id INTEGER NOT NULL REFERENCES "user"(id),
    status invitation_status_enum NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ NULL
);

-- Criar índice parcial para evitar convites duplicados pendentes
CREATE UNIQUE INDEX idx_unique_pending_invitation ON class_invitation (invited_user_id, class_id) 
WHERE status = 'pending';

-- Tabela study_log
CREATE TABLE study_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    study_plan_id INTEGER NOT NULL REFERENCES study_plan(id),
    discipline_id INTEGER NULL REFERENCES discipline(id),
    topic_id INTEGER NULL REFERENCES topic(id),
    activity_type activity_type_enum NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    items_attempted INTEGER NULL CHECK (items_attempted >= 0),
    items_correct INTEGER NULL CHECK (items_correct >= 0 AND (items_attempted IS NULL OR items_correct <= items_attempted)),
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar constraints para garantir integridade hierárquica
ALTER TABLE study_log ADD CONSTRAINT chk_topic_hierarchy 
CHECK (
    (topic_id IS NULL) OR 
    (topic_id IS NOT NULL AND discipline_id IS NOT NULL AND 
     (SELECT discipline_id FROM topic WHERE id = topic_id) = discipline_id)
);

ALTER TABLE study_log ADD CONSTRAINT chk_discipline_hierarchy 
CHECK (
    (discipline_id IS NULL) OR 
    (discipline_id IS NOT NULL AND 
     (SELECT study_plan_id FROM discipline WHERE id = discipline_id) = study_plan_id)
);

-- Tabela review_item
CREATE TABLE review_item (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    topic_id INTEGER NOT NULL REFERENCES topic(id),
    study_plan_id INTEGER NOT NULL REFERENCES study_plan(id),
    next_review_date DATE NOT NULL,
    last_reviewed_at TIMESTAMPTZ NULL,
    current_interval_days INTEGER NULL,
    ease_factor NUMERIC(4,2) NULL,
    repetitions INTEGER NOT NULL DEFAULT 0,
    status review_item_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela notification
CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_to TEXT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar comentários para documentação (opcional mas recomendado)
COMMENT ON TABLE "user" IS 'Armazena informações dos usuários do sistema';
COMMENT ON COLUMN "user".role IS 'Perfil do usuário no sistema: student, teacher_coordinator ou admin';

COMMENT ON TABLE study_plan IS 'Armazena os planos de estudo, que podem ser pessoais de um aluno ou o plano principal de uma turma';
COMMENT ON TABLE class IS 'Armazena informações sobre as turmas criadas por professores/coordenadores';
COMMENT ON TABLE discipline IS 'Armazena as disciplinas ou componentes dentro de um plano de estudo';
COMMENT ON TABLE topic IS 'Armazena os tópicos, aulas ou capítulos dentro de uma disciplina';
COMMENT ON TABLE class_member IS 'Registra quais usuários (alunos) participam de quais turmas';
COMMENT ON TABLE class_join_request IS 'Registra as solicitações de alunos para entrar em turmas';
COMMENT ON TABLE class_invitation IS 'Registra os convites enviados por professores/coordenadores para alunos entrarem em turmas';
COMMENT ON TABLE study_log IS 'Registra as sessões de estudo dos alunos';
COMMENT ON TABLE review_item IS 'Armazena os itens (tópicos) que precisam ser revisados, com base na repetição espaçada';
COMMENT ON TABLE notification IS 'Armazena notificações para os usuários';