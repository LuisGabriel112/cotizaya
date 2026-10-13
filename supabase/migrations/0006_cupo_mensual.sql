-- Límite del plan gratis: 5 cotizaciones por mes calendario en hora de Veracruz.
-- La pantalla avisa antes; esta regla es la que manda aunque la pantalla esté vieja.
-- Espejo en TypeScript: src/lib/plan/cupo.ts (mismas constantes y misma zona).

create function public.hoy_en_mexico() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'America/Mexico_City')::date
$$;

create function public.plan_de_pago_vigente(p_plan text, p_hasta date) returns boolean
language sql stable set search_path = '' as $$
  select p_plan = 'fundador' and (p_hasta is null or p_hasta >= public.hoy_en_mexico())
$$;

create function public.exigir_cupo_mensual() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_plan text;
  v_hasta date;
  v_usadas int;
begin
  -- Bloquea la fila del taller: dos altas simultáneas no se cuelan juntas a la sexta.
  select plan, plan_until into v_plan, v_hasta
    from public.workshops where id = new.workshop_id for update;
  if public.plan_de_pago_vigente(v_plan, v_hasta) then
    return new;
  end if;
  select count(*) into v_usadas
    from public.quotes
   where workshop_id = new.workshop_id
     and created_at >= (date_trunc('month', now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City');
  if v_usadas >= 5 then
    raise exception 'limite-mensual' using errcode = 'CY429',
      hint = 'El plan gratis permite 5 cotizaciones por mes.';
  end if;
  return new;
end $$;

-- Los triggers before corren en orden alfabético: el cupo va antes que el folio
-- para no gastar folios en altas rechazadas.
create trigger quotes_cupo_mensual
before insert on public.quotes
for each row execute function public.exigir_cupo_mensual();

-- Nunca se usó: el cupo se cuenta en vivo sobre quotes.
alter table public.workshops drop column quotes_this_month;

revoke execute on function public.exigir_cupo_mensual(), public.hoy_en_mexico(), public.plan_de_pago_vigente(text, date)
  from public, anon, authenticated;
