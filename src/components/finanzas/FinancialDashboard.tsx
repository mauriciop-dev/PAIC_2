import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CATEGORIAS_GASTO_MAPA, CATEGORIAS_INGRESO_MAPA } from "@/data/financial-data";

type Props = { data: { incomes: any[]; expenses: any[] } };

const COLORS = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4"];

export default function FinancialDashboard({ data }: Props) {
  const totalIncomes = data.incomes.reduce((s, i) => s + Number(i.monto || 0), 0);
  const totalExpenses = data.expenses.reduce((s, e) => s + Number(e.monto || 0), 0);
  const balance = totalIncomes - totalExpenses;

  const incomesByCat: Record<string, number> = {};
  data.incomes.forEach((i) => {
    const cat = CATEGORIAS_INGRESO_MAPA[i.categoria] ?? i.categoria ?? "Otros";
    incomesByCat[cat] = (incomesByCat[cat] ?? 0) + Number(i.monto || 0);
  });
  const expensesByCat: Record<string, number> = {};
  data.expenses.forEach((e) => {
    const cat = CATEGORIAS_GASTO_MAPA[e.categoria] ?? e.categoria ?? "Otros";
    expensesByCat[cat] = (expensesByCat[cat] ?? 0) + Number(e.monto || 0);
  });
  const pieData = Object.entries(incomesByCat).map(([name, value]) => ({ name, value }));
  const barData = Object.entries(expensesByCat).map(([name, gasto]) => ({ name, gasto }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-sm text-gray-500">Total Ingresos</p><p className="text-2xl font-bold text-green-600">${totalIncomes.toLocaleString("es-CO")}</p></div>
        <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-sm text-gray-500">Total Gastos</p><p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString("es-CO")}</p></div>
        <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-sm text-gray-500">Balance</p><p className={"text-2xl font-bold " + (balance >= 0 ? "text-blue-600" : "text-red-600")}>${balance.toLocaleString("es-CO")}</p></div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold mb-4">Ingresos por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold mb-4">Gastos por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}><BarChart data={barData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="gasto" fill="#EF4444" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
