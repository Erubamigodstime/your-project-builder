CREATE TABLE public._phase1_probe (
  id int PRIMARY KEY,
  note text NOT NULL
);

GRANT ALL ON public._phase1_probe TO service_role;

ALTER TABLE public._phase1_probe ENABLE ROW LEVEL SECURITY;

INSERT INTO public._phase1_probe (id, note) VALUES (1, 'applied by the agent');