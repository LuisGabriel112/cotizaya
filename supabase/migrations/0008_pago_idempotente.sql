-- El crédito no depende del último estado notificado: approved puede repetirse
-- después de pending/refunded. La marca persiste aunque cambie status.
alter table public.payments add column credited_at timestamptz;
update public.payments set credited_at = now() where status = 'approved';

create or replace function public.registrar_pago(
  p_taller uuid, p_external_id text, p_metodo text, p_monto int, p_periodo text, p_status text
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_pago public.payments;
begin
  if coalesce(p_external_id, '') = '' or length(p_external_id) > 200
     or p_status is null or p_status not in ('pending','approved','authorized','in_process',
        'in_mediation','rejected','cancelled','refunded','charged_back')
     or p_periodo is null or p_periodo not in ('mes','anio')
     or p_monto is distinct from (case p_periodo when 'mes' then 9900 when 'anio' then 99000 end) then
    raise exception 'pago-invalido' using errcode = '22023';
  end if;
  -- ON CONFLICT espera al INSERT concurrente y no genera un 500 por entrega duplicada.
  insert into public.payments (workshop_id, metodo, monto_centavos, periodo, status, external_id)
  values (p_taller, p_metodo, p_monto, p_periodo, p_status, p_external_id)
  on conflict (external_id) do nothing;
  select * into strict v_pago from public.payments where external_id = p_external_id for update;
  if v_pago.workshop_id <> p_taller or v_pago.periodo <> p_periodo
     or v_pago.monto_centavos <> p_monto or v_pago.metodo <> p_metodo then
    raise exception 'pago-no-corresponde' using errcode = '22023';
  end if;
  if p_status = 'approved' and v_pago.credited_at is null then
    perform public.extender_plan(p_taller, p_periodo);
    update public.payments set credited_at = now() where id = v_pago.id;
  end if;
  update public.payments set status = p_status where id = v_pago.id;
end $$;

revoke execute on function public.registrar_pago(uuid, text, text, int, text, text)
  from public, anon, authenticated;
grant execute on function public.registrar_pago(uuid, text, text, int, text, text) to service_role;
