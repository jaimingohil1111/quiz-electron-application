-- Create a sample quiz (admin will be created by backend init script with a hashed password)
INSERT INTO quizzes (title, slug, description, category, difficulty, tags, status, time_limit_sec)
VALUES (
  'General Knowledge (Demo)',
  'general-knowledge-demo',
  'A short demo quiz.',
  'General',
  'Easy',
  '["demo","gk"]',
  'published',
  300
);

-- Add a couple of questions
INSERT INTO questions (quiz_id, type, text, options, correct, explanation, tags, difficulty, position)
VALUES
  (
    (SELECT id FROM quizzes WHERE slug='general-knowledge-demo'),
    'mcq',
    'What is the capital of France?',
    '["Paris","Berlin","Madrid","Rome"]',
    '["Paris"]',
    'Paris is the capital and most populous city of France.',
    '["geography"]',
    'Easy',
    1
  ),
  (
    (SELECT id FROM quizzes WHERE slug='general-knowledge-demo'),
    'tf',
    'The Earth is flat.',
    NULL,
    '["false"]',
    'It is an oblate spheroid.',
    '["science"]',
    'Easy',
    2
  );
