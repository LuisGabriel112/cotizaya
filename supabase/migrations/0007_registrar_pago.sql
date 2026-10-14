-- Pagos de Mercado Pago. Solo el webhook (service_role) los registra, y solo
-- después de verificar la firma y consultar el pago a la API de Mercado Pago.

-- Pagar antes de vencer suma al tiempo que queda; ya vencido, cuenta desde hoy.
-- Un fundador sin fecha (alta manual del admin) se queda sin fecha.
create function public.extender_plan(p_taller uuid, p_periodo text) returns void
language sql security definer set search_path = '' as $$
  update public.workshops
     set plan = 'fundador',
         is_founder = true,
         plan_until = case
           when plan = 'fundador' and plan_until is null then null
           else (greatest(coalesce(plan_until, public.hoy_en_mexico()), public.hoy_en_mexico())
                 + case p_periodo when 'anio' then interval '1 year' else interval '1 month' end)::date
         end
   where id = p_taller
$$;

-- Idempotente por external_id: Mercado Pago reintenta y manda varias
-- notificaciones del mismo pago; el plan se extiende una sola vez, al pasar a approved.
create function public.registrar_pago(
  p_taller uuid, p_external_id text, p_metodo text, p_monto int, p_periodo text, p_status text
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_previo text;
begin
  select status into v_previo from public.payments where external_id = p_external_id for update;
  if not found then
    insert into public.payments (workshop_id, metodo, monto_centavos, periodo, status, external_id)
    values (p_taller, p_metodo, p_monto, p_periodo, p_status, p_external_id);
  else
    update public.payments set status = p_status where external_id = p_external_id;
  end if;
  if p_status = 'approved' and v_previo is distinct from 'approved' then
    perform public.extender_plan(p_taller, p_periodo);
  end if;
end $$;

revoke execute on function public.extender_plan(uuid, text), public.registrar_pago(uuid, text, text, int, text, text)
  from public, anon, authenticated;
grant execute on function public.registrar_pago(uuid, text, text, int, text, text) to service_role;
