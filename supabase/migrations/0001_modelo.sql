-- Modelo de Cotiza Ya. Montos en centavos (int), medidas en cm (int).
-- Cada tabla de taller lleva workshop_id; la RLS vive en 0002.

create extension if not exists pgcrypto with schema extensions;

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references auth.users (id) on delete set null,
  -- Teléfono del dueño como lo guarda Supabase Auth: 52 + 10 dígitos, sin "+".
  -- Permite que el admin dé de alta el taller antes de que el dueño entre.
  owner_phone text not null unique check (owner_phone ~ '^52[0-9]{10}$'),
  nombre text not null check (length(trim(nombre)) > 0),
  ciudad text not null default '',
  logo_url text,
  telefono text not null default '',
  condiciones text not null default '',
  plan text not null default 'gratis' check (plan in ('gratis', 'fundador')),
  plan_until date,
  quotes_this_month int not null default 0,
  is_founder boolean not null default false,
  siguiente_folio int not null default 1 check (siguiente_folio > 0),
  created_at timestamptz not null default now()
);

-- Catálogo con el que nace cada taller. Solo lo leen funciones security definer.
create table public.materiales_base (
  clave text primary key,
  nombre text not null,
  linea text not null default '',
  unidad text not null check (unidad in ('m2', 'ml', 'pieza')),
  precio_centavos int not null check (precio_centavos >= 0),
  pieza_singular text,
  pieza_plural text
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  -- Clave estable para reimportar el CSV sin duplicar.
  clave text not null check (length(trim(clave)) > 0),
  nombre text not null check (length(trim(nombre)) > 0),
  linea text not null default '',
  unidad text not null check (unidad in ('m2', 'ml', 'pieza')),
  precio_centavos int not null check (precio_centavos >= 0),
  pieza_singular text,
  pieza_plural text,
  unique (workshop_id, clave),
  unique (id, workshop_id)
);

-- Plantillas de un toque. workshop_id null = global.
-- Una plantilla es una sola partida; el material va por clave porque cada
-- taller tiene su propia copia del catálogo.
create table public.item_templates (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid references public.workshops (id) on delete cascade,
  clave text not null,
  nombre text not null,
  descripcion text not null,
  material_clave text not null,
  mano_obra_centavos int not null check (mano_obra_centavos >= 0),
  croquis text not null,
  orden int not null default 0,
  unique nulls not distinct (workshop_id, clave)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  nombre text not null,
  telefono text not null default '',
  unique (id, workshop_id)
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  client_id uuid,
  folio int not null,
  cliente_nombre text not null default '',
  status text not null default 'borrador'
    check (status in ('borrador', 'enviada', 'vista', 'aceptada', 'rechazada')),
  descuento_pct int not null default 0 check (descuento_pct between 0 and 100),
  con_iva boolean not null default false,
  acabado text not null default 'natural' check (acabado in ('natural', 'anodizado', 'electrostatica')),
  garantia_salitre boolean not null default true,
  subtotal_centavos int not null default 0,
  descuento_centavos int not null default 0,
  iva_centavos int not null default 0,
  total_centavos int not null default 0,
  public_slug text not null unique,
  viewed_at timestamptz,
  aviso_pendiente boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workshop_id, folio),
  unique (id, workshop_id),
  foreign key (client_id, workshop_id) references public.clients (id, workshop_id) on delete set null (client_id)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null,
  workshop_id uuid not null,
  orden int not null default 0,
  plantilla_clave text not null default '',
  descripcion text not null,
  material_id uuid,
  -- Foto del material al cotizar: si el catálogo cambia, la cotización enviada no.
  unidad text not null check (unidad in ('m2', 'ml', 'pieza')),
  precio_centavos int not null check (precio_centavos >= 0),
  pieza_singular text,
  pieza_plural text,
  ancho_cm int not null default 0 check (ancho_cm >= 0),
  alto_cm int not null default 0 check (alto_cm >= 0),
  cantidad int not null check (cantidad > 0),
  mano_obra_centavos int not null check (mano_obra_centavos >= 0),
  importe_centavos int not null default 0,
  -- La partida y su material deben ser del mismo taller que la cotización.
  foreign key (quote_id, workshop_id) references public.quotes (id, workshop_id) on delete cascade,
  foreign key (material_id, workshop_id) references public.materials (id, workshop_id) on delete set null (material_id)
);

create table public.quote_events (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null,
  workshop_id uuid not null,
  tipo text not null check (tipo in ('enviada', 'abierta', 'aceptada')),
  created_at timestamptz not null default now(),
  foreign key (quote_id, workshop_id) references public.quotes (id, workshop_id) on delete cascade
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  proveedor text not null default 'mercadopago',
  metodo text not null check (metodo in ('tarjeta', 'oxxo', 'transferencia')),
  monto_centavos int not null check (monto_centavos >= 0),
  periodo text not null check (periodo in ('mes', 'anio')),
  status text not null,
  external_id text unique,
  created_at timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create index on public.quotes (workshop_id, folio desc);
create index on public.quote_items (quote_id, orden);
create index on public.quote_events (quote_id);

-- Folio consecutivo por taller y slug público aleatorio. El cliente nunca los elige.
-- security definer: el dueño no tiene permiso de escribir siguiente_folio.
create function public.asignar_folio_y_slug() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.workshops
     set siguiente_folio = siguiente_folio + 1
   where id = new.workshop_id
  returning siguiente_folio - 1 into new.folio;
  new.public_slug := lpad(new.folio::text, 4, '0') || '-'
    || encode(extensions.gen_random_bytes(6), 'hex');
  return new;
end $$;

create trigger quotes_folio_slug
before insert on public.quotes
for each row execute function public.asignar_folio_y_slug();

revoke execute on function public.asignar_folio_y_slug() from public, anon, authenticated;
