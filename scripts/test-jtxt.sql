-- Test _jtxt function
SELECT public._jtxt('{"title": "Test"}'::jsonb, 'title') AS test1;
SELECT public._jtxt('{"title": "Test"}'::jsonb, 'missing') AS test2;

