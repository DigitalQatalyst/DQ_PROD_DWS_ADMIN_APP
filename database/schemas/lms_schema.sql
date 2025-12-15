-- LMS (Learning Management System) Schema
-- This schema supports learning paths, courses, modules, lessons, and quizzes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LEARNING PATHS TABLE
CREATE TABLE IF NOT EXISTS public.lms_learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    duration INTEGER DEFAULT 0, -- Duration in minutes
    level_code TEXT, -- SFIA Level Code (e.g., "L0. Starting (Learning)")
    department TEXT,
    audience TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    highlights TEXT[] DEFAULT '{}',
    outcomes TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    image_url TEXT,
    faq JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.lms_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    delivery_mode TEXT CHECK (delivery_mode IN ('online', 'in-person', 'hybrid')),
    duration INTEGER DEFAULT 0, -- Duration in minutes
    level_code TEXT, -- SFIA Level Code
    department TEXT,
    audience TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    highlights TEXT[] DEFAULT '{}',
    outcomes TEXT[] DEFAULT '{}',
    course_type TEXT CHECK (course_type IN ('Course (Single Lesson)', 'Course (Multi-Lessons)')),
    track TEXT,
    rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    image_url TEXT,
    faq JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PATH ITEMS (Linker table for Learning Paths and Courses)
CREATE TABLE IF NOT EXISTS public.lms_path_items (
    path_id UUID REFERENCES public.lms_learning_paths(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.lms_courses(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (path_id, course_id)
);

-- 4. MODULES TABLE
CREATE TABLE IF NOT EXISTS public.lms_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 0, -- Duration in minutes
    item_order INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lms_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.lms_modules(id) ON DELETE SET NULL, -- Optional: lessons can belong directly to course or to a module
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 0, -- Duration in minutes
    item_order INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    content TEXT, -- Markdown content for text-based lessons
    video_url TEXT, -- URL to video file in storage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.lms_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lms_lessons(id) ON DELETE CASCADE, -- Optional: Quiz can be tied to a specific lesson (end-of-lesson quiz)
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB DEFAULT '[]', -- Array of question objects
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lms_learning_paths_slug ON public.lms_learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_lms_learning_paths_status ON public.lms_learning_paths(status);
CREATE INDEX IF NOT EXISTS idx_lms_learning_paths_category ON public.lms_learning_paths(category);

CREATE INDEX IF NOT EXISTS idx_lms_courses_slug ON public.lms_courses(slug);
CREATE INDEX IF NOT EXISTS idx_lms_courses_status ON public.lms_courses(status);
CREATE INDEX IF NOT EXISTS idx_lms_courses_category ON public.lms_courses(category);
CREATE INDEX IF NOT EXISTS idx_lms_courses_course_id ON public.lms_courses(id);

CREATE INDEX IF NOT EXISTS idx_lms_path_items_path_id ON public.lms_path_items(path_id);
CREATE INDEX IF NOT EXISTS idx_lms_path_items_course_id ON public.lms_path_items(course_id);
CREATE INDEX IF NOT EXISTS idx_lms_path_items_position ON public.lms_path_items(position);

CREATE INDEX IF NOT EXISTS idx_lms_modules_course_id ON public.lms_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lms_modules_item_order ON public.lms_modules(item_order);

CREATE INDEX IF NOT EXISTS idx_lms_lessons_course_id ON public.lms_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lms_lessons_module_id ON public.lms_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lms_lessons_item_order ON public.lms_lessons(item_order);

CREATE INDEX IF NOT EXISTS idx_lms_quizzes_course_id ON public.lms_quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_lms_quizzes_lesson_id ON public.lms_quizzes(lesson_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_lms_learning_paths_updated_at BEFORE UPDATE ON public.lms_learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_courses_updated_at BEFORE UPDATE ON public.lms_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_modules_updated_at BEFORE UPDATE ON public.lms_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_lessons_updated_at BEFORE UPDATE ON public.lms_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lms_quizzes_updated_at BEFORE UPDATE ON public.lms_quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
-- Enable RLS on all tables
ALTER TABLE public.lms_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_path_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_quizzes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all LMS content
CREATE POLICY "Allow public read LMS learning paths" ON public.lms_learning_paths
    FOR SELECT USING (true);

CREATE POLICY "Allow public read LMS courses" ON public.lms_courses
    FOR SELECT USING (true);

CREATE POLICY "Allow public read LMS path items" ON public.lms_path_items
    FOR SELECT USING (true);

CREATE POLICY "Allow public read LMS modules" ON public.lms_modules
    FOR SELECT USING (true);

CREATE POLICY "Allow public read LMS lessons" ON public.lms_lessons
    FOR SELECT USING (true);

CREATE POLICY "Allow public read LMS quizzes" ON public.lms_quizzes
    FOR SELECT USING (true);

-- Policy: Allow authenticated users to manage LMS content
-- For MS Entra ID authentication, we check if auth_user_profiles exists
-- If the table doesn't exist, we allow all authenticated users (you can restrict later)
DO $$
BEGIN
    -- Check if auth_user_profiles table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'auth_user_profiles'
    ) THEN
        -- Use RBAC-based policies with auth_user_profiles
        CREATE POLICY "Allow admins and editors to manage learning paths" ON public.lms_learning_paths
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    EXISTS (
                        SELECT 1 FROM public.auth_user_profiles
                        WHERE user_id = auth.uid()
                        AND role IN ('admin', 'editor', 'creator', 'contributor')
                    )
                )
            );

        CREATE POLICY "Allow admins and editors to manage courses" ON public.lms_courses
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    EXISTS (
                        SELECT 1 FROM public.auth_user_profiles
                        WHERE user_id = auth.uid()
                        AND role IN ('admin', 'editor', 'creator', 'contributor')
                    )
                )
            );

        CREATE POLICY "Allow admins and editors to manage path items" ON public.lms_path_items
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    EXISTS (
                        SELECT 1 FROM public.auth_user_profiles
                        WHERE user_id = auth.uid()
                        AND role IN ('admin', 'editor', 'creator', 'contributor')
                    )
                )
            );

        CREATE POLICY "Allow admins and editors to manage modules" ON public.lms_modules
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    EXISTS (
                        SELECT 1 FROM public.auth_user_profiles
                        WHERE user_id = auth.uid()
                        AND role IN ('admin', 'editor', 'creator', 'contributor')
                    )
                )
            );

        CREATE POLICY "Allow admins and editors to manage lessons" ON public.lms_lessons
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    EXISTS (
                        SELECT 1 FROM public.auth_user_profiles
                        WHERE user_id = auth.uid()
                        AND role IN ('admin', 'editor', 'creator', 'contributor')
                    )
                )
            );

        CREATE POLICY "Allow admins and editors to manage quizzes" ON public.lms_quizzes
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    EXISTS (
                        SELECT 1 FROM public.auth_user_profiles
                        WHERE user_id = auth.uid()
                        AND role IN ('admin', 'editor', 'creator', 'contributor')
                    )
                )
            );
    ELSE
        -- Fallback: Allow all authenticated users (restrict later based on your needs)
        -- For MS Entra ID, authentication is handled at the application level
        CREATE POLICY "Allow authenticated users to manage learning paths" ON public.lms_learning_paths
            FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow authenticated users to manage courses" ON public.lms_courses
            FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow authenticated users to manage path items" ON public.lms_path_items
            FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow authenticated users to manage modules" ON public.lms_modules
            FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow authenticated users to manage lessons" ON public.lms_lessons
            FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow authenticated users to manage quizzes" ON public.lms_quizzes
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE public.lms_learning_paths IS 'Learning paths that contain multiple courses';
COMMENT ON TABLE public.lms_courses IS 'Individual courses that can be part of learning paths';
COMMENT ON TABLE public.lms_path_items IS 'Junction table linking learning paths to courses with ordering';
COMMENT ON TABLE public.lms_modules IS 'Modules within a course';
COMMENT ON TABLE public.lms_lessons IS 'Lessons within a course (can be text or video)';
COMMENT ON TABLE public.lms_quizzes IS 'Quizzes associated with courses or specific lessons';

COMMENT ON COLUMN public.lms_lessons.content IS 'Markdown content for text-based lessons';
COMMENT ON COLUMN public.lms_lessons.video_url IS 'URL to video file stored in lms-content bucket';
COMMENT ON COLUMN public.lms_quizzes.lesson_id IS 'Optional: If set, quiz is tied to a specific lesson (end-of-lesson quiz)';
COMMENT ON COLUMN public.lms_quizzes.questions IS 'JSON array of question objects with options and correct_answer';

