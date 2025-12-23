-- Migration: Add module_id column to lms_lessons table
-- This allows lessons to optionally belong to modules or directly to courses

-- Add module_id column (nullable, with foreign key constraint)
ALTER TABLE public.lms_lessons
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.lms_modules(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lms_lessons_module_id ON public.lms_lessons(module_id);

-- Comment for documentation
COMMENT ON COLUMN public.lms_lessons.module_id IS 'Optional: Module this lesson belongs to. If NULL, lesson belongs directly to the course.';



