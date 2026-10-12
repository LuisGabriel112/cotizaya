-- Catálogo base y plantillas de costa. Precios de ejemplo; cada taller ajusta los suyos.
-- Las claves coinciden con src/lib/demo/catalogo.ts y plantillas.ts.

insert into public.materiales_base (clave, nombre, linea, unidad, precio_centavos, pieza_singular, pieza_plural) values
  ('corrediza-2-6mm',   'Corrediza 2" natural, vidrio 6 mm', '2"',           'm2',    185000, null,   null),
  ('cancel-templado',   'Cancel de baño, templado 6 mm',     'Cancel',       'm2',    240000, null,   null),
  ('mosquitero-fibra',  'Mosquitero de fibra de vidrio',     'Mosquitero',   'ml',      9500, null,   null),
  ('abatible-1-34',     'Puerta abatible 1¾", vidrio 6 mm',  '1¾"',          'm2',    290000, null,   null),
  ('felpa-rodamientos', 'Felpa y rodamientos, por hoja',     'Mantenimiento','pieza',  18000, 'hoja', 'hojas'),
  ('perfil-corrosion',  'Perfil de reemplazo por corrosión', 'Reparación',   'ml',     21000, null,   null)
on conflict (clave) do nothing;

insert into public.item_templates (workshop_id, clave, nombre, descripcion, material_clave, mano_obra_centavos, croquis, orden) values
  (null, 'corrediza',  'Corrediza',           'Ventana corrediza',                 'corrediza-2-6mm',   35000, 'corrediza',  1),
  (null, 'cancel',     'Cancel de baño',      'Cancel de baño',                    'cancel-templado',   60000, 'cancel',     2),
  (null, 'mosquitero', 'Mosquitero',          'Mosquitero',                        'mosquitero-fibra',  15000, 'mosquitero', 3),
  (null, 'abatible',   'Puerta abatible',     'Puerta abatible',                   'abatible-1-34',     80000, 'abatible',   4),
  (null, 'felpa',      'Felpa y rodamientos', 'Cambio de felpa y rodamientos',     'felpa-rodamientos', 25000, 'felpa',      5),
  (null, 'corrosion',  'Corrosión',           'Reemplazo de perfil por corrosión', 'perfil-corrosion',  40000, 'corrosion',  6)
on conflict (workshop_id, clave) do nothing;
