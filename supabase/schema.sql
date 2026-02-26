-- Personal HQ Schema
-- Запусти это в SQL Editor в Supabase (Database > SQL Editor)

-- Отключаем RLS для личного использования (если используешь только сам)
-- Или настрой политики ниже для нормальной защиты

-- THOUGHTS
CREATE TABLE IF NOT EXISTS thoughts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  content     TEXT NOT NULL,
  tags        TEXT[] DEFAULT '{}',
  pinned      BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#6366f1',
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'done')),
  deadline    DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PROJECT STAGES
CREATE TABLE IF NOT EXISTS project_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  status      TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  "order"     INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PROJECT TASKS
CREATE TABLE IF NOT EXISTS project_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage_id    UUID REFERENCES project_stages(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  done        BOOLEAN DEFAULT false,
  deadline    DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PROJECT NOTES
CREATE TABLE IF NOT EXISTS project_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PROJECT LINKS
CREATE TABLE IF NOT EXISTS project_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT NOT NULL,
  comment     TEXT,
  date        TIMESTAMPTZ DEFAULT now()
);

-- BUDGET LIMITS
CREATE TABLE IF NOT EXISTS budget_limits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  category    TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  UNIQUE(user_id, category)
);

-- INDEXES (ускорят запросы)
CREATE INDEX IF NOT EXISTS idx_thoughts_user    ON thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user    ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project    ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_stages_project   ON project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- RLS POLICIES (включи если хочешь безопасность, но для личного использования можно отключить)
-- По умолчанию RLS выключен. Для личного использования это ок.
-- Если хочешь включить - раскомментируй и настрой по своему user_id:

-- ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Own thoughts" ON thoughts USING (user_id = current_setting('app.user_id'));
-- (и так для каждой таблицы)
