create table public.agendamento_servicos (
  agendamento_id uuid not null references public.agendamentos(id) on delete cascade,
  servico_id uuid not null references public.servicos(id) on delete restrict,
  ordem smallint not null default 0,
  primary key (agendamento_id, servico_id)
);

alter table public.agendamento_servicos enable row level security;

create policy "dono gerencia servicos do agendamento"
on public.agendamento_servicos
for all
to authenticated
using ((select public.usuario_e_dono()))
with check ((select public.usuario_e_dono()));

revoke all on table public.agendamento_servicos from anon;
grant select, insert, update, delete on table public.agendamento_servicos to authenticated;
