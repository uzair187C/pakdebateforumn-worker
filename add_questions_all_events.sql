-- Add questions to ghb event
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('ghb', 'Full Name', 'text', 1, 1);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('ghb', 'Email Address', 'email', 1, 2);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('ghb', 'Institution / School', 'text', 1, 3);
INSERT INTO questions (event_id, question_text, type, required, options, order_no) VALUES ('ghb', 'Debating Experience', 'select', 1, '["Beginner","Intermediate","Advanced"]', 4);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('ghb', 'Anything you''d like us to know?', 'textarea', 0, 5);

-- Add questions to ghbaa event
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('ghbaa', 'Full Name', 'text', 1, 1);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('ghbaa', 'Email Address', 'email', 1, 2);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('ghbaa', 'Institution / School', 'text', 1, 3);
INSERT INTO questions (event_id, question_text, type, required, options, order_no) VALUES ('ghbaa', 'Debating Experience', 'select', 1, '["Beginner","Intermediate","Advanced"]', 4);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('ghbaa', 'Anything you''d like us to know?', 'textarea', 0, 5);

-- Add questions to bbbb event
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('bbbb', 'Full Name', 'text', 1, 1);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('bbbb', 'Email Address', 'email', 1, 2);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('bbbb', 'Institution / School', 'text', 1, 3);
INSERT INTO questions (event_id, question_text, type, required, options, order_no) VALUES ('bbbb', 'Debating Experience', 'select', 1, '["Beginner","Intermediate","Advanced"]', 4);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('bbbb', 'Anything you''d like us to know?', 'textarea', 0, 5);

-- Add questions to pak-debate-2026 event
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('pak-debate-2026', 'Full Name', 'text', 1, 1);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('pak-debate-2026', 'Email Address', 'email', 1, 2);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('pak-debate-2026', 'Institution / School', 'text', 1, 3);
INSERT INTO questions (event_id, question_text, type, required, options, order_no) VALUES ('pak-debate-2026', 'Debating Experience', 'select', 1, '["Beginner","Intermediate","Advanced"]', 4);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('pak-debate-2026', 'Anything you''d like us to know?', 'textarea', 0, 5);

-- Add questions to new event
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('new', 'Full Name', 'text', 1, 1);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('new', 'Email Address', 'email', 1, 2);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('new', 'Institution / School', 'text', 1, 3);
INSERT INTO questions (event_id, question_text, type, required, options, order_no) VALUES ('new', 'Debating Experience', 'select', 1, '["Beginner","Intermediate","Advanced"]', 4);
INSERT INTO questions (event_id, question_text, type, required, order_no) VALUES ('new', 'Anything you''d like us to know?', 'textarea', 0, 5);
