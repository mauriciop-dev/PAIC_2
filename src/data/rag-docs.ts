export function searchRagDocs(query: string): string {
  const q = query.toLowerCase();
  const sections: string[] = [];
  if (q.includes("pago") || q.includes("cuota") || q.includes("administración")) sections.push(`
## Pago de la Cuota de Administración
La cuota de administración se paga mensualmente y cubre los gastos de funcionamiento de la copropiedad. El pago puede realizarse por transferencia bancaria, efectivo o PSE hasta el día 10 de cada mes. Después de esta fecha se generan intereses de mora del 2% mensual.`);
  if (q.includes("asamblea") || q.includes("votación") || q.includes("reunión")) sections.push(`
## Asamblea General de Copropietarios
Se realiza una vez al año para aprobar el presupuesto, elegir el consejo de administración y discutir temas de interés común. Las decisiones se toman por mayoría de votos según coeficientes.`);
  if (q.includes("multa") || q.includes("sanción") || q.includes("infracción")) sections.push(`
## Multas y Sanciones
El Reglamento de Propiedad Horizontal faculta al administrador para imponer multas. El proceso incluye: 1) Notificación por escrito, 2) Plazo para descargos, 3) Decisión del Consejo de Administración.`);
  if (q.includes("mascota") || q.includes("perro") || q.includes("animal")) sections.push(`
## Mascotas
Se permite máximo una mascota por unidad privada. Deben estar registradas en administración. No se permiten mascotas en áreas comunes como piscina, gimnasio o zonas verdes.`);
  if (q.includes("parqueadero") || q.includes("parqueo") || q.includes("estacionamiento")) sections.push(`
## Parqueaderos
Los parqueaderos son de uso exclusivo del propietario. No está permitido:
- Prestar o alquilar el parqueadero a personas ajenas a la copropiedad
- Almacenar objetos diferentes al vehículo
- Lavar vehículos en el parqueadero`);
  if (q.includes("piscina") || q.includes("zona social") || q.includes("área común")) sections.push(`
## Áreas Comunes
Las áreas comunes pueden reservarse a través del sistema PAIC. Horario: 6:00 AM - 10:00 PM. El residente es responsable del estado del área después de su uso.`);
  if (sections.length === 0) sections.push(`## PAIC 2.0
Plataforma para la Administración Inteligente de Copropiedades. Módulos disponibles: Dashboard, Base de Datos, Finanzas, Tareas, Seguridad, Vencimientos, Áreas Comunes, Cámaras, Cartelera, Comunicaciones, Archivos.`);
  return sections.join("\n\n");
}

export const SYSTEM_PROMPT = `Eres PAIC-AI, el asistente virtual de PAIC 2.0 - Plataforma para la Administración Inteligente de Copropiedades. Tu función es ayudar a administradores y residentes de propiedades horizontales (edificios, conjuntos residenciales) a gestionar su copropiedad. Respondes preguntas sobre la plataforma y provees información general sobre administración de copropiedades en Colombia.`;
