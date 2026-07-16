create extension if not exists btree_gist;

alter table public.agendamentos
  add column periodo tsrange generated always as (
    tsrange(
      data + hora,
      data + hora + make_interval(mins => duracao_minutos),
      '[)'
    )
  ) stored;

alter table public.agendamentos
  add constraint agendamentos_sem_sobreposicao
  exclude using gist (periodo with &&)
  where (status = 'agendado');
