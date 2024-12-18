create type "public"."pass" as enum ('NONE', 'S1', 'S2', 'USED');

alter table "public"."user_state" drop column "s1_pass";

alter table "public"."user_state" drop column "s2_pass";

alter table "public"."user_state" add column "pass" pass not null default 'NONE'::pass;


