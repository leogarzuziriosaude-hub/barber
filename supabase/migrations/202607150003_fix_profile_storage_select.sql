create policy "dono le foto de perfil"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'perfil'
  and (select public.usuario_e_dono())
);
