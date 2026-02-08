-- 1. Activar las extensiones necesarias (ejecutar primero)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Programar la actualización de lunes a viernes a las 9:00 AM UTC
-- Nota: Sustituye '<TU_PROYECTO>' por tu ID de proyecto: ndpfcmvqgvrllisfkzsy
-- Nota: Sustituye '<SERVICE_ROLE_TOKEN>' por tu Service Role Token
-- O mejor aún, usa la URL de la Edge Function una vez desplegada.

SELECT cron.schedule(
  'sync-eia-daily', 
  '0 9 * * 1-5',    
  $$
  SELECT
    net.http_post(
      url:='https://ndpfcmvqgvrllisfkzsy.supabase.co/functions/v1/sync-eia',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGZjbXZxZ3ZybGxpc2ZrenN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MTY5MSwiZXhwIjoyMDg1ODI3NjkxfQ.9-6NXNJyrtPTBzMzFZDkf9gDmHYikW6jc5LoPsOrypE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

/*
  PARA REVISAR EL ESTADO DE LAS TAREAS:
  SELECT * FROM cron.job;
  SELECT * FROM cron.job_run_details ORDER BY start_time DESC;
*/
