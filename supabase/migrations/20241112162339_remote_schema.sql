create type "public"."state" as enum ('outside', 'checkpoint', 'backstage', 'field');

alter type "public"."gates" rename to "gates__old_version_to_be_dropped";

create type "public"."gates" as enum ('S1', 'S2', 'S3', 'NONE');

alter table "public"."activity" alter column gate type "public"."gates" using gate::text::"public"."gates";

alter table "public"."controllers" alter column gate type "public"."gates" using gate::text::"public"."gates";

drop type "public"."gates__old_version_to_be_dropped";

alter table "public"."controllers" alter column "dni" set data type integer using "dni"::integer;

alter table "public"."controllers" alter column "gate" drop not null;

alter table "public"."pass" drop column "used";

alter table "public"."pass" add column "gate" gates not null;

alter table "public"."pass" add column "granted_by" bigint not null;

alter table "public"."pass" alter column "used_at" set data type timestamp with time zone using "used_at"::timestamp with time zone;

alter table "public"."users" add column "state" state not null default 'outside'::state;

alter table "public"."pass" add constraint "pass_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES controllers(id) not valid;

alter table "public"."pass" validate constraint "pass_granted_by_fkey";

create policy "Enable read access for authenticated users"
on "public"."controllers"
as permissive
for select
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."pass"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for authenticated users"
on "public"."pass"
as permissive
for select
to authenticated
using (true);


create policy "Enable read access for authenticated users"
on "public"."users"
as permissive
for select
to authenticated
using (true);


create policy "Enable update for authenticated users only"
on "public"."users"
as permissive
for update
to authenticated
using (true)
with check (true);



