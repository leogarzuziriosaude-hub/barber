create extension if not exists pgcrypto;

create table public.configuracoes (
  id smallint primary key default 1 constraint configuracoes_unica check (id = 1),
  owner_id uuid not null unique references auth.users(id) on delete restrict,
  nome text not null default 'Barbearia PH10' constraint configuracoes_nome check (length(trim(nome)) > 0),
  subtitulo text not null default 'Estúdio masculino',
  responsavel text not null default 'Pedro Henrique' constraint configuracoes_responsavel check (length(trim(responsavel)) > 0),
  whatsapp text not null default '5521994073006' constraint configuracoes_whatsapp check (whatsapp ~ '^55[0-9]{10,11}$'),
  endereco text not null default '',
  foto_url text,
  intervalo_minutos integer not null default 30 constraint configuracoes_intervalo check (intervalo_minutos in (15, 30, 45, 60)),
  antecedencia_minutos integer not null default 120 constraint configuracoes_antecedencia check (antecedencia_minutos >= 0),
  dias_para_agendar integer not null default 15 constraint configuracoes_janela check (dias_para_agendar between 1 and 365),
  timezone text not null default 'America/Sao_Paulo',
  dias_funcionamento jsonb not null default '[
    {"id":"domingo","nome":"Domingo","curto":"Dom","ativo":false,"abertura":"09:00","fechamento":"14:00","temPausa":false,"pausaInicio":"12:00","pausaFim":"13:00"},
    {"id":"segunda","nome":"Segunda-feira","curto":"Seg","ativo":true,"abertura":"09:00","fechamento":"18:00","temPausa":true,"pausaInicio":"12:00","pausaFim":"13:00"},
    {"id":"terca","nome":"Terça-feira","curto":"Ter","ativo":true,"abertura":"09:00","fechamento":"18:00","temPausa":true,"pausaInicio":"12:00","pausaFim":"13:00"},
    {"id":"quarta","nome":"Quarta-feira","curto":"Qua","ativo":true,"abertura":"09:00","fechamento":"18:00","temPausa":true,"pausaInicio":"12:00","pausaFim":"13:00"},
    {"id":"quinta","nome":"Quinta-feira","curto":"Qui","ativo":true,"abertura":"09:00","fechamento":"18:00","temPausa":true,"pausaInicio":"12:00","pausaFim":"13:00"},
    {"id":"sexta","nome":"Sexta-feira","curto":"Sex","ativo":true,"abertura":"09:00","fechamento":"18:00","temPausa":true,"pausaInicio":"12:00","pausaFim":"13:00"},
    {"id":"sabado","nome":"Sábado","curto":"Sáb","ativo":true,"abertura":"09:00","fechamento":"14:00","temPausa":false,"pausaInicio":"12:00","pausaFim":"13:00"}
  ]'::jsonb constraint configuracoes_dias_json check (jsonb_typeof(dias_funcionamento) = 'array'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null constraint servicos_nome check (length(trim(nome)) > 0),
  duracao_minutos integer not null constraint servicos_duracao check (duracao_minutos > 0),
  valor_centavos integer not null constraint servicos_valor check (valor_centavos > 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.combos (
  id uuid primary key default gen_random_uuid(),
  nome text not null constraint combos_nome check (length(trim(nome)) > 0),
  duracao_minutos integer not null constraint combos_duracao check (duracao_minutos > 0),
  valor_centavos integer not null constraint combos_valor check (valor_centavos > 0),
  desconto_percentual integer not null default 0 constraint combos_desconto check (desconto_percentual between 0 and 99),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.combo_servicos (
  combo_id uuid not null references public.combos(id) on delete cascade,
  servico_id uuid not null references public.servicos(id) on delete restrict,
  ordem smallint not null default 0,
  primary key (combo_id, servico_id)
);

create table public.bloqueios (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  dia_inteiro boolean not null default false,
  inicio time,
  fim time,
  motivo text not null constraint bloqueios_motivo check (length(trim(motivo)) > 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint bloqueios_periodo check (
    (dia_inteiro and inicio is null and fim is null)
    or
    (not dia_inteiro and inicio is not null and fim is not null and inicio < fim)
  )
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null constraint clientes_nome check (length(trim(nome)) > 0),
  whatsapp text not null unique constraint clientes_whatsapp check (whatsapp ~ '^55[0-9]{10,11}$'),
  email text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  protocolo text not null unique constraint agendamentos_protocolo check (protocolo ~ '^PH10-[A-Z0-9]{6}$'),
  cliente_id uuid references public.clientes(id) on delete set null,
  cliente_nome text not null constraint agendamentos_cliente_nome check (length(trim(cliente_nome)) > 0),
  whatsapp text not null constraint agendamentos_whatsapp check (whatsapp ~ '^55[0-9]{10,11}$'),
  item_tipo text not null constraint agendamentos_item_tipo check (item_tipo in ('servico', 'combo')),
  servico_id uuid references public.servicos(id) on delete set null,
  combo_id uuid references public.combos(id) on delete set null,
  item_nome text not null,
  data date not null,
  hora time not null,
  duracao_minutos integer not null constraint agendamentos_duracao check (duracao_minutos > 0),
  valor_centavos integer not null constraint agendamentos_valor check (valor_centavos > 0),
  status text not null default 'agendado' constraint agendamentos_status check (status in ('agendado', 'cancelado', 'nao_compareceu')),
  historico jsonb not null default '[]'::jsonb constraint agendamentos_historico_json check (jsonb_typeof(historico) = 'array'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index agendamentos_data_hora_idx on public.agendamentos (data, hora);
create index agendamentos_whatsapp_idx on public.agendamentos (whatsapp);
create index agendamentos_status_idx on public.agendamentos (status);
create index bloqueios_data_idx on public.bloqueios (data);

create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger configuracoes_atualizado_em before update on public.configuracoes for each row execute function public.definir_atualizado_em();
create trigger servicos_atualizado_em before update on public.servicos for each row execute function public.definir_atualizado_em();
create trigger combos_atualizado_em before update on public.combos for each row execute function public.definir_atualizado_em();
create trigger bloqueios_atualizado_em before update on public.bloqueios for each row execute function public.definir_atualizado_em();
create trigger clientes_atualizado_em before update on public.clientes for each row execute function public.definir_atualizado_em();
create trigger agendamentos_atualizado_em before update on public.agendamentos for each row execute function public.definir_atualizado_em();

create or replace function public.usuario_e_dono()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.configuracoes
    where id = 1 and owner_id = (select auth.uid())
  );
$$;

revoke all on function public.usuario_e_dono() from public;
grant execute on function public.usuario_e_dono() to authenticated;

alter table public.configuracoes enable row level security;
alter table public.servicos enable row level security;
alter table public.combos enable row level security;
alter table public.combo_servicos enable row level security;
alter table public.bloqueios enable row level security;
alter table public.clientes enable row level security;
alter table public.agendamentos enable row level security;

create policy "dono gerencia configuracoes" on public.configuracoes for all to authenticated using ((select public.usuario_e_dono())) with check ((select public.usuario_e_dono()));
create policy "dono gerencia servicos" on public.servicos for all to authenticated using ((select public.usuario_e_dono())) with check ((select public.usuario_e_dono()));
create policy "dono gerencia combos" on public.combos for all to authenticated using ((select public.usuario_e_dono())) with check ((select public.usuario_e_dono()));
create policy "dono gerencia combo servicos" on public.combo_servicos for all to authenticated using ((select public.usuario_e_dono())) with check ((select public.usuario_e_dono()));
create policy "dono gerencia bloqueios" on public.bloqueios for all to authenticated using ((select public.usuario_e_dono())) with check ((select public.usuario_e_dono()));
create policy "dono gerencia clientes" on public.clientes for all to authenticated using ((select public.usuario_e_dono())) with check ((select public.usuario_e_dono()));
create policy "dono gerencia agendamentos" on public.agendamentos for all to authenticated using ((select public.usuario_e_dono())) with check ((select public.usuario_e_dono()));

revoke all on table public.configuracoes, public.servicos, public.combos, public.combo_servicos, public.bloqueios, public.clientes, public.agendamentos from anon;
grant select, insert, update, delete on table public.configuracoes, public.servicos, public.combos, public.combo_servicos, public.bloqueios, public.clientes, public.agendamentos to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('perfil', 'perfil', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "dono envia foto de perfil" on storage.objects for insert to authenticated with check (bucket_id = 'perfil' and (select public.usuario_e_dono()));
create policy "dono atualiza foto de perfil" on storage.objects for update to authenticated using (bucket_id = 'perfil' and (select public.usuario_e_dono())) with check (bucket_id = 'perfil' and (select public.usuario_e_dono()));
create policy "dono remove foto de perfil" on storage.objects for delete to authenticated using (bucket_id = 'perfil' and (select public.usuario_e_dono()));
