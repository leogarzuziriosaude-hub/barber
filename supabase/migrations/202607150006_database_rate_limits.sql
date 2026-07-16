create table public.rate_limites (
  chave text primary key constraint rate_limites_chave check (length(chave) between 16 and 128),
  tentativas integer not null default 0 constraint rate_limites_tentativas check (tentativas >= 0),
  janela_iniciada_em timestamptz not null default now(),
  bloqueado_ate timestamptz,
  atualizado_em timestamptz not null default now()
);

alter table public.rate_limites enable row level security;

revoke all on table public.rate_limites from anon, authenticated;
grant select, insert, update, delete on table public.rate_limites to service_role;

create or replace function public.consumir_rate_limit(
  p_chave text,
  p_limite integer,
  p_janela_segundos integer,
  p_bloqueio_segundos integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_agora timestamptz := clock_timestamp();
  v_registro public.rate_limites%rowtype;
  v_tentativas integer;
  v_tentar_em integer;
begin
  if length(p_chave) not between 16 and 128
    or p_limite <= 0
    or p_janela_segundos <= 0
    or p_bloqueio_segundos <= 0 then
    raise exception 'Parametros de rate limit invalidos';
  end if;

  insert into public.rate_limites (chave, tentativas, janela_iniciada_em, atualizado_em)
  values (p_chave, 0, v_agora, v_agora)
  on conflict (chave) do nothing;

  select *
  into v_registro
  from public.rate_limites
  where chave = p_chave
  for update;

  if v_registro.bloqueado_ate is not null and v_registro.bloqueado_ate > v_agora then
    v_tentar_em := greatest(1, ceil(extract(epoch from (v_registro.bloqueado_ate - v_agora)))::integer);
    return jsonb_build_object('permitido', false, 'restantes', 0, 'tentar_em', v_tentar_em);
  end if;

  if v_registro.janela_iniciada_em + make_interval(secs => p_janela_segundos) <= v_agora then
    v_registro.tentativas := 0;
    v_registro.janela_iniciada_em := v_agora;
    v_registro.bloqueado_ate := null;
  end if;

  v_tentativas := v_registro.tentativas + 1;

  if v_tentativas > p_limite then
    update public.rate_limites
    set tentativas = v_tentativas,
        janela_iniciada_em = v_registro.janela_iniciada_em,
        bloqueado_ate = v_agora + make_interval(secs => p_bloqueio_segundos),
        atualizado_em = v_agora
    where chave = p_chave;

    return jsonb_build_object(
      'permitido', false,
      'restantes', 0,
      'tentar_em', p_bloqueio_segundos
    );
  end if;

  update public.rate_limites
  set tentativas = v_tentativas,
      janela_iniciada_em = v_registro.janela_iniciada_em,
      bloqueado_ate = null,
      atualizado_em = v_agora
  where chave = p_chave;

  return jsonb_build_object(
    'permitido', true,
    'restantes', greatest(0, p_limite - v_tentativas)
  );
end;
$$;

create or replace function public.limpar_rate_limit(p_chave text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.rate_limites where chave = p_chave;
$$;

revoke all on function public.consumir_rate_limit(text, integer, integer, integer) from public;
revoke all on function public.limpar_rate_limit(text) from public;
grant execute on function public.consumir_rate_limit(text, integer, integer, integer) to service_role;
grant execute on function public.limpar_rate_limit(text) to service_role;
