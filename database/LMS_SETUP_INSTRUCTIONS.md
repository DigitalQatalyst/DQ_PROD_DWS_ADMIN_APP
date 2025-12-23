# LMS Database Schema Setup Instructions

## Quick Start

1. **Run the SQL schema:**
   - Open Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `database/schemas/lms_schema.sql`
   - Click "Run" to create all tables, indexes, and policies

2. **Set up storage bucket:**
   - Option A: Use Supabase Storage (Recommended)
     - Run `database/setup_supabase_storage.sql` in SQL Editor
     - Or create bucket manually in Storage dashboard:
       - Name: `lms-content`
       - Public: Yes
       - File size limit: 50MB
   
   - Option B: Use Azure Storage
     - Create Azure Storage account and container `lms-content`
     - Configure environment variables (see docs/configuration/LMS_STORAGE_SETUP.md)

3. **Verify installation:**
   ```sql
   -- Check tables
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'lms_%';
   
   -- Should return:
   -- lms_learning_paths
   -- lms_courses
   -- lms_path_items
   -- lms_modules
   -- lms_lessons
   -- lms_quizzes
   ```

## Storage Bucket Structure

Files are organized in the `lms-content` bucket as follows:

```
lms-content/
  course/
    {course-slug}/                    # Course folder
      images/                         # Course/Path images
        {item-id}-{filename}
      {module-slug}/                  # Optional module folder
        videos/                        # Lesson videos
          {item-id}-{filename}
        images/                        # Module images
          {item-id}-{filename}
        documents/                    # Module documents
          {item-id}-{filename}
```

### Example Paths:

- **Learning Path Image:**
  `lms-content/course/intro-to-cloud/images/path-abc123-banner.jpg`

- **Course Image:**
  `lms-content/course/intro-to-cloud/images/course-def456-thumbnail.jpg`

- **Lesson Video (with module):**
  `lms-content/course/intro-to-cloud/module-1-basics/videos/lesson-ghi789-intro.mp4`

- **Lesson Video (no module):**
  `lms-content/course/intro-to-cloud/videos/lesson-ghi789-intro.mp4`

## File Upload Handling

### For Supabase Storage (Current Implementation):

The forms use `uploadLMSFileSupabase()` which:
- Automatically generates the correct path based on course slug
- Handles file naming with timestamps and item IDs
- Returns public URL for immediate use
- Respects 50MB file size limit

### Large Files (>50MB):

For videos larger than 50MB:
1. **Supabase Storage**: Currently limited to 50MB per file
   - Consider using Azure Storage for larger videos
   - Or implement Supabase Storage chunked upload (future enhancement)

2. **Azure Storage**: Supports chunked uploads automatically
   - Files >50MB are split into 4MB chunks
   - Chunks uploaded separately
   - Committed together at the end

## Database Schema Details

### Table Relationships:

```
lms_learning_paths (1) ──< lms_path_items >── (N) lms_courses
                                                      │
                                                      ├──< lms_modules (N)
                                                      ├──< lms_lessons (N)
                                                      └──< lms_quizzes (N)
```

### Key Constraints:

- **Unique Slugs**: Both learning paths and courses have unique slugs
- **Cascade Deletes**: Deleting a course deletes all modules, lessons, and quizzes
- **Foreign Keys**: All relationships use proper foreign keys with CASCADE
- **Arrays**: Highlights and outcomes stored as PostgreSQL arrays
- **JSONB**: FAQ and quiz questions stored as JSONB for flexibility

### Indexes:

All tables have indexes on:
- Foreign keys (course_id, path_id)
- Slugs (for URL lookups)
- Status (for filtering)
- Item order (for sorting)

## RLS Policies

The schema includes Row Level Security policies:

- **Read Access**: All authenticated users can read LMS content
- **Write Access**: Only users with 'admin' or 'editor' roles can create/update/delete

To modify policies, edit the `CREATE POLICY` statements in `lms_schema.sql`.

## Next Steps

1. ✅ Run the schema SQL
2. ✅ Set up storage bucket
3. ✅ Test file uploads
4. ✅ Create your first learning path
5. ✅ Add courses to learning paths
6. ✅ Create modules and lessons
7. ✅ Add quizzes

## Troubleshooting

### "Table already exists" error
- Tables may already exist from previous setup
- Use `DROP TABLE IF EXISTS` statements if you need to recreate

### "Permission denied" on storage
- Check bucket policies in Supabase Dashboard
- Verify RLS policies allow your user role

### File upload fails
- Check file size (50MB limit for Supabase)
- Verify bucket exists and is public
- Check CORS settings if using Azure Storage

### Foreign key constraint errors
- Ensure courses exist before creating modules/lessons
- Ensure learning paths exist before linking courses



