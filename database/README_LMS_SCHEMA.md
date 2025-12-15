# LMS Database Schema

## Overview

This schema supports a Learning Management System (LMS) with learning paths, courses, modules, lessons, and quizzes.

## Tables

### 1. `lms_learning_paths`
Learning paths that contain multiple courses.

**Key Fields:**
- `slug` - URL-friendly identifier (unique)
- `title`, `provider`, `description`, `category`
- `level_code` - SFIA Level Code (e.g., "L0. Starting (Learning)")
- `department`, `audience`
- `highlights[]`, `outcomes[]` - Arrays of strings
- `rating`, `review_count`
- `image_url` - Path to image in storage
- `faq` - JSONB array

### 2. `lms_courses`
Individual courses that can be part of learning paths.

**Key Fields:**
- `slug` - URL-friendly identifier (unique)
- `title`, `provider`, `description`, `category`
- `delivery_mode` - 'online', 'in-person', or 'hybrid'
- `course_type` - 'Course (Single Lesson)' or 'Course (Multi-Lessons)'
- `level_code` - SFIA Level Code
- `department`, `audience`
- `highlights[]`, `outcomes[]` - Arrays of strings
- `image_url` - Path to image in storage

### 3. `lms_path_items`
Junction table linking learning paths to courses with ordering.

**Key Fields:**
- `path_id` - References `lms_learning_paths.id`
- `course_id` - References `lms_courses.id`
- `position` - Order within the learning path
- Primary key: `(path_id, course_id)`

### 4. `lms_modules`
Modules within a course.

**Key Fields:**
- `course_id` - References `lms_courses.id`
- `title`, `description`
- `duration` - Minutes
- `item_order` - Order within the course
- `is_locked` - Whether module requires completion of previous modules

### 5. `lms_lessons`
Lessons within a course (can be text or video).

**Key Fields:**
- `course_id` - References `lms_courses.id`
- `title`, `description`
- `duration` - Minutes
- `item_order` - Order within the course
- `is_locked` - Whether lesson requires completion of previous lessons
- `content` - Markdown content for text-based lessons
- `video_url` - URL to video file in storage bucket

### 6. `lms_quizzes`
Quizzes associated with courses.

**Key Fields:**
- `course_id` - References `lms_courses.id`
- `title`, `description`
- `questions` - JSONB array of question objects:
  ```json
  [
    {
      "id": "q1",
      "question": "What is...?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_answer": 0
    }
  ]
  ```

## Storage Structure

Files are stored in Azure Storage with the following structure:

```
lms-content/
  course/
    {course-slug}/
      {module-slug}/          (optional)
        videos/
          {item-id}-{filename}
        images/
          {item-id}-{filename}
        documents/
          {item-id}-{filename}
```

**Examples:**
- Learning Path Image: `lms-content/course/introduction-to-cloud/images/path-123-image.jpg`
- Course Image: `lms-content/course/introduction-to-cloud/images/course-456-image.jpg`
- Lesson Video: `lms-content/course/introduction-to-cloud/module-1/videos/lesson-789-video.mp4`

## Installation

1. Run the SQL schema file in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of database/schemas/lms_schema.sql
   ```

2. Verify tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'lms_%';
   ```

3. Check indexes:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename LIKE 'lms_%';
   ```

## File Upload Handling

### Large Files (>50MB)

For video files larger than 50MB, the system uses chunked upload:
- Files are split into 4MB chunks
- Each chunk is uploaded separately
- Chunks are committed together at the end

### Storage Provider

Use `uploadLMSFile()` from `src/lib/lmsStorageProvider.ts`:

```typescript
import { uploadLMSFile } from '@/lib/lmsStorageProvider';

const result = await uploadLMSFile({
  file: videoFile,
  courseSlug: 'introduction-to-cloud',
  moduleSlug: 'module-1', // optional
  itemType: 'video',
  itemId: lessonId,
});

// result.publicUrl contains the public URL
// result.blobPath contains the storage path
```

## RLS Policies

The schema includes Row Level Security (RLS) policies:
- **Read**: All authenticated users can read LMS content
- **Write**: Only users with 'admin' or 'editor' roles can create/update/delete

Adjust policies in `lms_schema.sql` based on your RBAC implementation.

## Notes

- All tables have `created_at` and `updated_at` timestamps
- `updated_at` is automatically updated via triggers
- Foreign keys use `ON DELETE CASCADE` for data integrity
- Arrays (highlights, outcomes) default to empty arrays
- JSONB fields (faq, questions) default to empty arrays


