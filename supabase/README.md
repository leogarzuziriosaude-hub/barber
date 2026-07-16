# Supabase da PH10

O banco é versionado por migrations em `supabase/migrations`.

## Primeira configuração

1. No painel do Supabase, abra **SQL Editor**.
2. Execute todos os arquivos de `migrations` em ordem numérica, do `202607150001` ao mais recente. Cada arquivo deve ser executado uma única vez.
3. Em **Authentication > Users**, crie manualmente o usuário do Pedro.
4. Copie o UUID do usuário e execute:

```sql
insert into public.configuracoes (id, owner_id)
values (1, 'UUID_DO_PEDRO');
```

5. Em **Authentication > Providers > Email**, mantenha novos cadastros públicos desativados. Apenas o usuário criado manualmente deve acessar o painel.
6. Copie `.env.example` para `.env.local` e preencha as chaves do projeto.

Nunca exponha `SUPABASE_SECRET_KEY` em componentes client ou variáveis `NEXT_PUBLIC_*`.

## Banco já configurado

Não execute novamente migrations que já foram aplicadas no projeto atual. Os arquivos versionados servem para reproduzir o esquema em um banco novo e registrar a evolução da estrutura.
