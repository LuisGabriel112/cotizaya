-- Lista positiva: nuevas columnas internas nunca llegan por accidente al enlace público.
create or replace function public.cotizacion_publica(p_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'quote',jsonb_build_object('id',q.public_slug,'folio',q.folio,'cliente_nombre',q.cliente_nombre,
      'status',q.status,'descuento_pct',q.descuento_pct,'con_iva',q.con_iva,'acabado',q.acabado,
      'garantia_salitre',q.garantia_salitre,'public_slug',q.public_slug,'viewed_at',q.viewed_at,
      'created_at',q.created_at,'sent_at',q.sent_at,'expires_at',q.expires_at),
    'items',coalesce((select jsonb_agg(jsonb_build_object('id',md5(i.id::text),'orden',i.orden,
      'plantilla_clave',i.plantilla_clave,'descripcion',i.descripcion,'unidad',i.unidad,
      'precio_centavos',i.precio_centavos,'pieza_singular',i.pieza_singular,'pieza_plural',i.pieza_plural,
      'ancho_cm',i.ancho_cm,'alto_cm',i.alto_cm,'cantidad',i.cantidad,
      'mano_obra_centavos',i.mano_obra_centavos,'importe_centavos',i.importe_centavos) order by i.orden,i.id)
      from public.quote_items i where i.quote_id=q.id),'[]'::jsonb),
    'taller',jsonb_build_object('nombre',w.nombre,'ciudad',w.ciudad,'telefono',w.telefono,
      'condiciones',w.condiciones,'logo_url',w.logo_url,'plan',w.plan))
  from public.quotes q join public.workshops w on w.id=q.workshop_id
  where q.public_slug=p_slug and (q.status<>'borrador' or w.owner_id=auth.uid())
$$;
