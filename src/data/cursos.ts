export const cursos = [
  { id: "introduccion", titulo: "Introducción a la Propiedad Horizontal", contenido: "La propiedad horizontal en Colombia se rige por la Ley 675 de 2001...", preguntas: ["Qué es una copropiedad?", "Cuál es el marco legal?"] },
  { id: "asambleas", titulo: "Asambleas y Toma de Decisiones", contenido: "Las asambleas generales de copropietarios son el máximo órgano de decisión...", preguntas: ["Cómo convocar una asamblea?", "Qué es el quórum?"] },
  { id: "finanzas", titulo: "Finanzas y Presupuesto", contenido: "El presupuesto anual de la copropiedad debe ser aprobado por la asamblea...", preguntas: ["Cómo crear un presupuesto?", "Qué son los gastos comunes?"] },
  { id: "reglamento", titulo: "Reglamento Interno y Convivencia", contenido: "El reglamento interno establece las normas de convivencia...", preguntas: ["Qué debe incluir el reglamento?", "Cómo modificar el reglamento?"] },
  { id: "cobranza", titulo: "Cobranza y Cartera", contenido: "La cartera morosa es uno de los principales desafíos...", preguntas: ["Cómo gestionar la cartera?", "Cuáles son las etapas del cobro?"] },
  { id: "contratos", titulo: "Contratos y Proveedores", contenido: "La administración debe gestionar contratos de servicios...", preguntas: ["Qué contratos son necesarios?", "Cómo elegir proveedores?"] },
];

export function buscarEnCursos(query: string): string {
  const q = query.toLowerCase();
  const results = cursos.filter(c => c.titulo.toLowerCase().includes(q) || c.contenido.toLowerCase().includes(q) || c.preguntas.some(p => p.toLowerCase().includes(q)));
  if (results.length === 0) return "";
  return results.map(c => `### ${c.titulo}\n${c.contenido}`).join("\n\n");
}

export function obtenerCursoCompleto(): string {
  return cursos.map(c => `# ${c.titulo}\n\n${c.contenido}`).join("\n\n---\n\n");
}
