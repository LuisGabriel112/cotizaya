/* eslint-disable jsx-a11y/alt-text -- react-pdf Image no admite alt; el nombre del taller aparece junto al logo. */
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentoPdf, RenglonPdf, TotalesPdf } from "./tipos";

const tinta = "#161616";
const estilos = StyleSheet.create({
  pagina: { padding: "18mm", color: tinta, fontFamily: "Helvetica", fontSize: 10 },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  taller: { maxWidth: "70%" },
  logo: { width: 70, height: 44, objectFit: "contain", marginBottom: 8 },
  nombre: { fontFamily: "Helvetica-Bold", fontSize: 16, marginBottom: 4 },
  sello: { borderWidth: 2, borderColor: tinta, padding: 8, fontFamily: "Courier-Bold", fontSize: 14 },
  datos: { marginBottom: 18, lineHeight: 1.6 },
  tabla: { borderTopWidth: 2, borderColor: tinta },
  fila: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderStyle: "dashed", borderColor: "#8C9399", paddingVertical: 10 },
  descripcion: { width: "44%" },
  medidas: { width: "25%", textAlign: "right", fontFamily: "Courier" },
  cantidad: { width: "11%", textAlign: "right", fontFamily: "Courier" },
  importe: { width: "20%", textAlign: "right", fontFamily: "Courier-Bold" },
  extras: { borderWidth: 1, borderColor: tinta, padding: 10, marginTop: 16 },
  extra: { marginVertical: 2 },
  sumas: { alignSelf: "flex-end", width: "52%", marginTop: 18 },
  suma: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  dinero: { fontFamily: "Courier" },
  dobleLinea: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: tinta, height: 5, marginTop: 8 },
  total: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, fontFamily: "Courier-Bold", fontSize: 18 },
  pie: { marginTop: 28, borderTopWidth: 1, borderStyle: "dashed", borderColor: "#8C9399", paddingTop: 12, lineHeight: 1.5 },
  marca: { marginTop: 14, fontSize: 8 },
});

function Encabezado({ doc }: { doc: DocumentoPdf }) {
  return <View style={estilos.encabezado}>
    <View style={estilos.taller}>
      {doc.taller.logoUrl && <Image src={doc.taller.logoUrl} style={estilos.logo} />}
      <Text style={estilos.nombre}>{doc.taller.nombre}</Text>
      <Text>{doc.taller.ciudad}</Text>
    </View>
    <Text style={estilos.sello}>No. {doc.folio}</Text>
  </View>;
}

function Fila({ renglon }: { renglon: RenglonPdf }) {
  return <View style={estilos.fila} wrap={false}>
    <Text style={estilos.descripcion}>{renglon.descripcion}</Text>
    <Text style={estilos.medidas}>{renglon.medidas}</Text>
    <Text style={estilos.cantidad}>{renglon.cantidad}</Text>
    <Text style={estilos.importe}>{renglon.importe}</Text>
  </View>;
}

function Tabla({ renglones }: Pick<DocumentoPdf, "renglones">) {
  return <View style={estilos.tabla}>
    <View style={estilos.fila} fixed>
      <Text style={estilos.descripcion}>PARTIDA</Text>
      <Text style={estilos.medidas}>MEDIDAS</Text>
      <Text style={estilos.cantidad}>CANT.</Text>
      <Text style={estilos.importe}>IMPORTE</Text>
    </View>
    {renglones.map((renglon, indice) => <Fila key={indice} renglon={renglon} />)}
  </View>;
}

function Sumas({ totales }: { totales: TotalesPdf }) {
  return <View style={estilos.sumas} wrap={false}>
    <View style={estilos.suma}><Text>Subtotal</Text><Text style={estilos.dinero}>{totales.subtotal}</Text></View>
    {totales.descuento && <View style={estilos.suma}><Text>{totales.descuento.etiqueta}</Text><Text style={estilos.dinero}>{totales.descuento.importe}</Text></View>}
    {totales.iva && <View style={estilos.suma}><Text>IVA 16%</Text><Text style={estilos.dinero}>{totales.iva}</Text></View>}
    <View style={estilos.dobleLinea} />
    <View style={estilos.total}><Text>TOTAL</Text><Text>{totales.total}</Text></View>
  </View>;
}

export function PlantillaPdf({ doc }: { doc: DocumentoPdf }) {
  return <Document>
    <Page size="LETTER" style={estilos.pagina}>
      <Encabezado doc={doc} />
      <View style={estilos.datos}>
        <Text>Para: {doc.cliente}</Text><Text>Fecha: {doc.fecha}</Text>
      </View>
      <Tabla renglones={doc.renglones} />
      {doc.extras.length > 0 && <View style={estilos.extras}>{doc.extras.map((extra) => <Text key={extra} style={estilos.extra}>{extra}</Text>)}</View>}
      <Sumas totales={doc.totales} />
      <View style={estilos.pie}>
        <Text>Condiciones de pago: {doc.condiciones}</Text>
        <Text>{doc.vigencia}</Text><Text>Teléfono: {doc.taller.telefono}</Text>
        {doc.conMarca && <Text style={estilos.marca}>Hecho con Cotiza Ya</Text>}
      </View>
    </Page>
  </Document>;
}
