alter table public.agendamentos
  drop constraint if exists agendamentos_item_tipo_check;

alter table public.agendamentos
  add constraint agendamentos_item_tipo_check
  check (item_tipo in ('servico', 'combo', 'itens'));

create table public.agendamento_combos (
  agendamento_id uuid not null references public.agendamentos(id) on delete cascade,
  combo_id uuid not null references public.combos(id) on delete restrict,
  ordem smallint not null default 0,
  primary key (agendamento_id, combo_id)
);

alter table public.agendamento_combos enable row level security;

create policy "dono gerencia combos do agendamento"
on public.agendamento_combos
for all
to authenticated
using ((select public.usuario_e_dono()))
with check ((select public.usuario_e_dono()));

revoke all on table public.agendamento_combos from anon;
grant select, insert, update, delete on table public.agendamento_combos to authenticated;
