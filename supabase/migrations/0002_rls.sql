-- RLS: cada dueño solo ve y escribe lo de su taller. Admin ve todo.
-- Los helpers son security definer para no caer en recursión de políticas.

create function public.mi_taller() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.workshops where owner_id = auth.uid()
$$;

create function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

revoke execute on function public.mi_taller(), public.es_admin() from public, anon;
grant execute on function public.mi_taller(), public.es_admin() to authenticated;

alter table public.workshops enable row level security;
alter table public.materiales_base enable row level security;
alter table public.materials enable row level security;
alter table public.item_templates enable row level security;
alter table public.clients enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_events enable row level security;
alter table public.payments enable row level security;
alter table public.admins enable row level security;

-- El visitante anónimo solo entra por las funciones de slug (0003).
revoke all on all tables in schema public from anon;
revoke all on public.materiales_base from authenticated;

-- workshops: el dueño lee el suyo y edita solo sus datos de contacto.
-- Plan, folio y teléfono del dueño solo cambian por funciones de admin o triggers.
revoke insert, update, delete on public.workshops from authenticated;
grant update (nombre, ciudad, telefono, condiciones) on public.workshops to authenticated;

create policy workshops_leer on public.workshops for select to authenticated
  using (owner_id = auth.uid() or public.es_admin());
create policy workshops_editar on public.workshops for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Tablas con workshop_id: misma regla para todas.
create policy materials_taller on public.materials for all to authenticated
  using (workshop_id = public.mi_taller() or public.es_admin())
  with check (workshop_id = public.mi_taller() or public.es_admin());

create policy clients_taller on public.clients for all to authenticated
  using (workshop_id = public.mi_taller())
  with check (workshop_id = public.mi_taller());

create policy quotes_taller on public.quotes for all to authenticated
  using (workshop_id = public.mi_taller())
  with check (workshop_id = public.mi_taller());

create policy quote_items_taller on public.quote_items for all to authenticated
  using (workshop_id = public.mi_taller())
  with check (workshop_id = public.mi_taller());

create policy quote_events_leer on public.quote_events for select to authenticated
  using (workshop_id = public.mi_taller());
create policy quote_events_enviada on public.quote_events for insert to authenticated
  with check (workshop_id = public.mi_taller() and tipo = 'enviada');

-- Folio, slug, apertura y taller no se reescriben desde el cliente.
revoke update on public.quotes from authenticated;
grant update (cliente_nombre, client_id, status, descuento_pct, con_iva, acabado, garantia_salitre,
              subtotal_centavos, descuento_centavos, iva_centavos, total_centavos, aviso_pendiente)
  on public.quotes to authenticated;
revoke update on public.quote_items from authenticated;
grant update (orden, plantilla_clave, descripcion, material_id, unidad, precio_centavos, pieza_singular,
              pieza_plural, ancho_cm, alto_cm, cantidad, mano_obra_centavos, importe_centavos)
  on public.quote_items to authenticated;

-- Plantillas: globales para todos, propias del taller, y admin.
create policy item_templates_leer on public.item_templates for select to authenticated
  using (workshop_id is null or workshop_id = public.mi_taller() or public.es_admin());
create policy item_templates_escribir on public.item_templates for all to authenticated
  using (workshop_id = public.mi_taller() or public.es_admin())
  with check (workshop_id = public.mi_taller() or public.es_admin());

-- Pagos: el dueño los ve; se escriben con la service key desde el webhook (fase 5).
revoke insert, update, delete on public.payments from authenticated;
create policy payments_leer on public.payments for select to authenticated
  using (workshop_id = public.mi_taller() or public.es_admin());

-- Admins: cada quien solo puede ver su propia fila.
revoke insert, update, delete on public.admins from authenticated;
create policy admins_propio on public.admins for select to authenticated
  using (user_id = auth.uid());
