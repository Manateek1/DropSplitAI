-- Demo seed for local Supabase development.
-- Login credentials after seeding:
-- email: dillon@dropsplit.dev
-- password: SwimFast123!

do $$
declare
  demo_user_id uuid := '11111111-1111-1111-1111-111111111111';
  demo_email text := 'dillon@dropsplit.dev';
  week_start date := date_trunc('week', current_date)::date;
  thread_id uuid := gen_random_uuid();
  upload_id uuid := gen_random_uuid();
  plan_id uuid := gen_random_uuid();
  monday_log_id uuid := gen_random_uuid();
  thursday_log_id uuid := gen_random_uuid();
  saturday_log_id uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where id = demo_user_id) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      demo_user_id,
      'authenticated',
      'authenticated',
      demo_email,
      crypt('SwimFast123!', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Dillon","full_name":"Dillon Nagar"}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    );
  end if;

  if not exists (select 1 from auth.identities where user_id = demo_user_id and provider = 'email') then
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      demo_user_id,
      jsonb_build_object('sub', demo_user_id::text, 'email', demo_email),
      'email',
      demo_email,
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now())
    );
  end if;

  delete from public.profiles where id = demo_user_id;

  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    avatar_url
  )
  values (
    demo_user_id,
    demo_email,
    'Dillon',
    'Nagar',
    'Dillon Nagar',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  );

  insert into public.swimmer_profiles (
    user_id,
    age,
    grade_group,
    skill_level,
    height_in_inches,
    weight_lbs,
    favorite_strokes,
    best_events,
    weaknesses,
    weekly_swim_days,
    pool_access,
    goals,
    target_events,
    current_training_level,
    soreness_notes,
    onboarding_completed
  )
  values (
    demo_user_id,
    16,
    '10th grade',
    'intermediate',
    70,
    150,
    array['Freestyle', 'Backstroke'],
    array['50 free', '100 free', '100 back'],
    array['Holding stroke count late in races', 'Race confidence off the blocks'],
    5,
    'School team with one optional Saturday club lane',
    array['Drop 3 seconds in the 100 free', 'Get more consistent turns'],
    array['100 free', '50 free', '100 back'],
    'High school in-season with one optional Saturday practice',
    'Gets tight shoulders after two hard sprint days in a row.',
    true
  );

  insert into public.swimmer_goals (user_id, title, detail, priority_order)
  values
    (demo_user_id, 'Drop 3 seconds in the 100 free', 'Improve last 35 yards and keep tempo under pressure.', 1),
    (demo_user_id, 'Get more consistent turns', 'Carry more speed through the flags and breakout.', 2),
    (demo_user_id, 'Build confidence in meet racing', 'Use simple race plans and stick to them.', 3);

  insert into public.swimmer_best_times (user_id, event_name, course, time_display, time_seconds, recorded_at, note, source)
  values
    (demo_user_id, '50 free', 'SCY', '25.29', 25.29, current_date - 2, 'New practice best from a push start.', 'manual'),
    (demo_user_id, '100 free', 'SCY', '55.88', 55.88, current_date - 6, 'Dual meet finals heat.', 'manual'),
    (demo_user_id, '100 back', 'SCY', '1:02.14', 62.14, current_date - 13, 'League prep meet.', 'manual');

  insert into public.weekly_plans (
    id,
    user_id,
    week_of,
    total_yardage,
    target_swim_days,
    stroke_focus,
    coach_summary,
    source
  )
  values (
    plan_id,
    demo_user_id,
    week_start,
    17800,
    5,
    'Freestyle speed endurance + backstroke underwaters',
    'This week builds your 100 free finish while keeping the shoulder load reasonable. Friday stays lighter so Saturday can still feel sharp.',
    'seed'
  );

  insert into public.workout_days (
    weekly_plan_id,
    user_id,
    day_index,
    day_label,
    day_date,
    focus,
    intensity,
    stroke_focus,
    total_yardage,
    coach_note,
    warmup_json,
    pre_set_json,
    main_set_json,
    kick_json,
    pull_json,
    drill_json,
    cooldown_json,
    dryland_json,
    completed
  )
  values
    (
      plan_id,
      demo_user_id,
      0,
      'Monday',
      week_start,
      'Freestyle threshold',
      'hard',
      '100 free pacing',
      3800,
      'Hold posture into every turn. Quality matters more than ripping the first round.',
      '[{"title":"Warmup","reps":"400 swim + 200 kick + 4 x 50 build","details":"Easy aerobic start, then bring the last 15 yards up to race rhythm.","focus":"Bodyline and breathing control","interval":"1:00 on the 50s","yardage":800}]'::jsonb,
      '[{"title":"Pre-set","reps":"8 x 25","details":"Odds fast breakout to 12.5, evens easy backstroke.","focus":"Explosive first strokes","rest":":20","yardage":200}]'::jsonb,
      '[{"title":"Main set","reps":"3 rounds","details":"2 x 100 free at strong pace, 1 x 50 easy, 2 x 75 descend 1-2.","focus":"Back-half speed without spinning","interval":"1:25 / 1:00","yardage":1350}]'::jsonb,
      '[{"title":"Kick","reps":"6 x 50 with fins","details":"25 underwater kick + 25 easy swim.","focus":"Underwater speed","interval":"1:10","yardage":300}]'::jsonb,
      '[{"title":"Pull","reps":"4 x 100 pull","details":"Negative split each one with paddles only if shoulders feel good.","focus":"Catch pressure","interval":"1:30","yardage":400}]'::jsonb,
      '[{"title":"Drill","reps":"6 x 50","details":"6-kick switch on back into smooth free.","focus":"Rotation timing","interval":"1:00","yardage":300}]'::jsonb,
      '[{"title":"Cooldown","reps":"450 easy","details":"Mix strokes and loosen shoulders.","focus":"Recovery","yardage":450}]'::jsonb,
      '[]'::jsonb,
      true
    ),
    (
      plan_id,
      demo_user_id,
      1,
      'Tuesday',
      week_start + 1,
      'Backstroke technique + aerobic support',
      'moderate',
      '100 back turns',
      3400,
      'Keep the head still into the flags and count strokes from the same marker each round.',
      '[{"title":"Warmup","reps":"600 as 200 swim / 200 pull / 200 IM drill","details":"Stay long and easy.","focus":"Range of motion","yardage":600}]'::jsonb,
      '[]'::jsonb,
      '[{"title":"Main set","reps":"16 x 75","details":"1-4 back drill/swim, 5-8 aerobic back, 9-12 strong free, 13-16 choice by 25.","focus":"Technique under fatigue","interval":"1:15","yardage":1200}]'::jsonb,
      '[{"title":"Kick","reps":"8 x 25 vertical kick + streamline swim","details":"15 seconds vertical kick then sprint streamline to 15 yards.","focus":"Core and body tension","rest":":30","yardage":200}]'::jsonb,
      '[]'::jsonb,
      '[{"title":"Drill","reps":"6 x 50 backstroke double-arm","details":"Pause in streamline off every wall.","focus":"Shoulder timing","interval":"1:05","yardage":300}]'::jsonb,
      '[{"title":"Cooldown","reps":"1100 easy mix","details":"Mostly free/back, finish with easy breaststroke.","focus":"Recovery volume","yardage":1100}]'::jsonb,
      '[]'::jsonb,
      true
    ),
    (
      plan_id,
      demo_user_id,
      2,
      'Wednesday',
      week_start + 2,
      'Recovery + skills',
      'easy',
      'Turns and breathing control',
      2800,
      'Today should feel smooth. If shoulders are heavy, shorten the paddles work or skip it.',
      '[{"title":"Warmup","reps":"500 choice swim + 4 x 50 kick","details":"Stay relaxed and keep the walls tidy.","focus":"Recovery rhythm","interval":"1:05","yardage":700}]'::jsonb,
      '[{"title":"Pre-set","reps":"8 x 25 scull/swim","details":"Alternate front scull and smooth freestyle.","focus":"Feel for the water","rest":":20","yardage":200}]'::jsonb,
      '[{"title":"Main set","reps":"3 x (200 free + 4 x 50 as 25 fast/25 easy)","details":"Hold clean turns and even breathing.","focus":"Aerobic reset","interval":"3:00 / 1:00","yardage":1200}]'::jsonb,
      '[{"title":"Kick","reps":"4 x 75 choice kick","details":"Keep it controlled, not max effort.","focus":"Leg activation","interval":"1:35","yardage":300}]'::jsonb,
      '[]'::jsonb,
      '[{"title":"Drill","reps":"6 x 50","details":"Catch-up into fingertip drag by 25.","focus":"Front-end timing","interval":"1:05","yardage":300}]'::jsonb,
      '[{"title":"Cooldown","reps":"100 easy + 4 x 25 float","details":"Finish loose.","focus":"Recovery","yardage":200}]'::jsonb,
      '[{"title":"Optional dryland","reps":"2 rounds","details":"8 band pull-aparts, 8 dead bugs, 30-second calf stretch.","focus":"Reset, not fatigue","yardage":0}]'::jsonb,
      false
    ),
    (
      plan_id,
      demo_user_id,
      3,
      'Thursday',
      week_start + 3,
      'Sprint power',
      'hard',
      '50 free speed',
      3600,
      'Attack the first 15 yards, then stay long instead of spinning.',
      '[{"title":"Warmup","reps":"600 swim / kick / pull by 200","details":"Build the last 50 of each 200.","focus":"Rhythm into speed","yardage":600}]'::jsonb,
      '[{"title":"Pre-set","reps":"10 x 25 from the blocks or a strong push","details":"Odd fast to 15m, even easy back.","focus":"Reaction and breakout","rest":":35","yardage":250}]'::jsonb,
      '[{"title":"Main set","reps":"4 rounds","details":"2 x 50 race-pace free, 1 x 100 easy, 2 x 25 all-out with full recovery.","focus":"Front-half speed with clean mechanics","interval":"2:00 / 3:00 / :50","yardage":1400}]'::jsonb,
      '[{"title":"Kick","reps":"8 x 25 underwater dolphin","details":"Fast to 12.5, easy to the wall.","focus":"Explosive underwaters","rest":":30","yardage":200}]'::jsonb,
      '[{"title":"Pull","reps":"4 x 100 pull easy","details":"Use it as active recovery.","focus":"Long freestyle line","interval":"1:35","yardage":400}]'::jsonb,
      '[{"title":"Drill","reps":"6 x 50 single-arm free","details":"Breathe low and keep hips high.","focus":"Catch path","interval":"1:00","yardage":300}]'::jsonb,
      '[{"title":"Cooldown","reps":"450 easy","details":"Mix strokes and fully reset.","focus":"Recovery","yardage":450}]'::jsonb,
      '[]'::jsonb,
      false
    ),
    (
      plan_id,
      demo_user_id,
      4,
      'Friday',
      week_start + 4,
      'Pre-meet sharpen',
      'recovery',
      'Starts, turns, confidence',
      2200,
      'Keep this one crisp and short. Leave the water feeling better than when you got in.',
      '[{"title":"Warmup","reps":"400 easy + 4 x 50 build","details":"Smooth early, then wake up the speed.","focus":"Feel and confidence","interval":"1:05","yardage":600}]'::jsonb,
      '[{"title":"Pre-set","reps":"6 x 25 choice drill","details":"Use the stroke you will race tomorrow.","focus":"Touch and timing","rest":":20","yardage":150}]'::jsonb,
      '[{"title":"Main set","reps":"2 rounds","details":"2 x 50 race-pace to the feet, 2 x 25 easy, 1 x 100 loosen.","focus":"Sharp but fresh","interval":"1:30 / :45 / 2:00","yardage":700}]'::jsonb,
      '[{"title":"Kick","reps":"4 x 25 fast kick","details":"Fast legs with full rest.","focus":"Wake up the tempo","rest":":30","yardage":100}]'::jsonb,
      '[]'::jsonb,
      '[{"title":"Drill","reps":"4 x 50 easy choice","details":"Finish with the stroke that makes you feel smooth.","focus":"Confidence","interval":"1:10","yardage":200}]'::jsonb,
      '[{"title":"Cooldown","reps":"450 easy","details":"Long strokes and relaxed breathing.","focus":"Recovery","yardage":450}]'::jsonb,
      '[]'::jsonb,
      false
    );

  insert into public.uploaded_files (
    id,
    user_id,
    file_name,
    storage_path,
    public_url,
    mime_type,
    size_bytes,
    kind,
    summary,
    extracted_entries_json
  )
  values (
    upload_id,
    demo_user_id,
    'league-finals-results.png',
    demo_user_id::text || '/league-finals-results.png',
    'https://example.com/league-finals-results.png',
    'image/png',
    284991,
    'meet-results',
    'Meet results screenshot with 50 free 25.29 and 100 free 55.88 highlighted.',
    '[{"event":"50 free","time":"25.29","confidence":0.95},{"event":"100 free","time":"55.88","confidence":0.82}]'::jsonb
  );

  insert into public.chat_threads (id, user_id, title)
  values (thread_id, demo_user_id, 'Coach chat');

  insert into public.chat_messages (user_id, thread_id, role, content, suggestions, actions_json, created_at)
  values
    (
      demo_user_id,
      thread_id,
      'assistant',
      'Nice work this week. Your 100 free trend is moving the right way, so let''s stay sharp on the back half and protect your shoulders.',
      array['Open today''s plan', 'What should I race?', 'Explain my sprint set'],
      '[]'::jsonb,
      timezone('utc', now()) - interval '3 days'
    ),
    (
      demo_user_id,
      thread_id,
      'user',
      'hey i swam 50 free today i got a 25.29',
      '{}'::text[],
      '[]'::jsonb,
      timezone('utc', now()) - interval '2 days'
    ),
    (
      demo_user_id,
      thread_id,
      'assistant',
      'That''s a strong swim. 25.29 is a real step forward for you. Biggest next win is cleaning up the breakout and holding your line the last 10 yards.',
      array['Log another time', 'Make today easier', 'What events fit me best?'],
      '[{"type":"log_swim_time","event":"50 free","time":"25.29","confidence":0.96}]'::jsonb,
      timezone('utc', now()) - interval '2 days' + interval '2 minutes'
    ),
    (
      demo_user_id,
      thread_id,
      'user',
      'make today easier, i''m sore',
      '{}'::text[],
      '[]'::jsonb,
      timezone('utc', now()) - interval '1 day'
    ),
    (
      demo_user_id,
      thread_id,
      'assistant',
      'Got it. Pull the intensity down today. Keep the warmup, cut one round from the main set, and turn the fast 25s into smooth build 25s. If your shoulders still feel heavy, stop after the drill work and recover.',
      array['Explain the changes', 'Give me a warmup', 'What should I race?'],
      '[{"type":"adjust_today_workout","adjustment":"easier"}]'::jsonb,
      timezone('utc', now()) - interval '1 day' + interval '3 minutes'
    );

  insert into public.swim_logs (
    id,
    user_id,
    uploaded_file_id,
    log_date,
    yardage,
    duration_minutes,
    log_type,
    soreness_level,
    note
  )
  values
    (monday_log_id, demo_user_id, null, week_start, 3800, 78, 'practice', 2, 'Threshold day. Last round got tough but turns stayed clean.'),
    (thursday_log_id, demo_user_id, null, week_start + 3, 3600, 72, 'practice', 3, 'Sprint power day. Best speed came when I stayed patient into the breakout.'),
    (saturday_log_id, demo_user_id, upload_id, week_start + 5, 0, 0, 'meet', 1, 'League finals results uploaded from screenshot.');

  insert into public.time_entries (
    user_id,
    swim_log_id,
    event_name,
    course,
    time_display,
    time_seconds,
    recorded_at,
    context,
    note,
    source,
    confidence
  )
  values
    (demo_user_id, monday_log_id, '100 free', 'SCY', '56.42', 56.42, week_start, 'practice', 'Broken pace work converted to a timed 100 from push.', 'manual', 0.92),
    (demo_user_id, thursday_log_id, '50 free', 'SCY', '25.61', 25.61, week_start + 3, 'practice', 'Timed 50 from push near the end of sprint set.', 'manual', 0.91),
    (demo_user_id, saturday_log_id, '50 free', 'SCY', '25.29', 25.29, week_start + 5, 'meet', 'Logged from meet results screenshot.', 'upload', 0.95),
    (demo_user_id, saturday_log_id, '100 free', 'SCY', '55.88', 55.88, week_start + 5, 'meet', 'Logged from meet results screenshot.', 'upload', 0.82);

  insert into public.coach_notes (user_id, title, body, category)
  values
    (demo_user_id, 'Event focus', 'Your best near-term upside is still in the 50 free and 100 free. The trend says your sprint speed is improving, and your 100 free can drop again if you hold posture off the second turn.', 'events'),
    (demo_user_id, 'Technique cue', 'When your tempo rises, keep the hand entry quiet and the head still. You are faster when the line stays clean instead of choppy.', 'technique'),
    (demo_user_id, 'Recovery reminder', 'Two heavy sprint days in a row usually tighten your shoulders. If that shows up, switch one hard set to aerobic drill work and get extra sleep that night.', 'recovery');

  insert into public.subscriptions (
    user_id,
    tier,
    status,
    monthly_message_limit,
    current_period_end
  )
  values (
    demo_user_id,
    'free',
    'free',
    40,
    date_trunc('month', timezone('utc', now())) + interval '1 month'
  );

  insert into public.usage_tracking (
    user_id,
    metric,
    current_count,
    period_start,
    period_end
  )
  values (
    demo_user_id,
    'ai_messages',
    12,
    date_trunc('month', timezone('utc', now())),
    date_trunc('month', timezone('utc', now())) + interval '1 month'
  );
end $$;
