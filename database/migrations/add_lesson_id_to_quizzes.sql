-- Migration: Add lesson_id column to lms_quizzes table
-- This allows quizzes to be tied to specific lessons (end-of-lesson quizzes)

-- Add lesson_id column (nullable, with foreign key constraint)
ALTER TABLE public.lms_quizzes
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lms_lessons(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lms_quizzes_lesson_id ON public.lms_quizzes(lesson_id);

-- Comment for documentation
COMMENT ON COLUMN public.lms_quizzes.lesson_id IS 'Optional: If set, quiz is tied to a specific lesson (end-of-lesson quiz)';


