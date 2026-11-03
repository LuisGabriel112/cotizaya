-- Un INSERT directo también cuenta en el mes real y siempre nace como borrador.
create function public.proteger_alta_cotizacion() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.created_at := now(); new.status := 'borrador';
  new.viewed_at := null; new.aviso_pendiente := false;
  return new;
end $$;

-- Debe ejecutarse antes de quotes_cupo_mensual y quotes_folio_slug.
create trigger a_quotes_alta before insert on public.quotes
  for each row execute function public.proteger_alta_cotizacion();
revoke execute on function public.proteger_alta_cotizacion() from public, anon, authenticated;

-- El MVP no ofrece eliminar cotizaciones; permitirlo mediante PostgREST reabre el cupo.
revoke delete on public.quotes from authenticated;
