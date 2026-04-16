CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'professor')
  )
$$;

DROP POLICY IF EXISTS "Staff can read all roles" ON public.user_roles;
CREATE POLICY "Staff can read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can read all progress" ON public.lesson_progress;
CREATE POLICY "Staff can read all progress" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can read all profiles" ON public.profiles;
CREATE POLICY "Staff can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.get_student_ranking()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  total_xp bigint,
  completed_lessons bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    lp.user_id,
    COALESCE(NULLIF(p.display_name, ''), 'Aluno') AS display_name,
    COALESCE(SUM(l.xp), 0)::bigint AS total_xp,
    COUNT(*)::bigint AS completed_lessons
  FROM public.lesson_progress lp
  INNER JOIN public.lessons l
    ON l.id = lp.lesson_id
  INNER JOIN public.user_roles ur
    ON ur.user_id = lp.user_id
   AND ur.role = 'student'
  LEFT JOIN public.profiles p
    ON p.user_id = lp.user_id
  WHERE lp.completed = true
  GROUP BY lp.user_id, p.display_name
  ORDER BY total_xp DESC, completed_lessons DESC, display_name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_ranking() TO authenticated;
