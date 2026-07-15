import { useState } from "react";
import GridLayout, { getCompactor, type LayoutItem } from "react-grid-layout";
import { Users, DollarSign, CreditCard, CheckSquare } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

type Props = { stats: any; loading: boolean };

const STAT_CARDS = [
  { key: "residents", label: "Residentes", icon: Users, color: "bg-blue-500" },
  { key: "incomes", label: "Ingresos", icon: DollarSign, color: "bg-green-500" },
  { key: "expenses", label: "Gastos", icon: CreditCard, color: "bg-red-500" },
  { key: "tasks", label: "Tareas", icon: CheckSquare, color: "bg-purple-500" },
];

const layout: LayoutItem[] = STAT_CARDS.map((c, i) => ({ i: c.key, x: (i % 2) * 3, y: Math.floor(i / 2) * 2, w: 3, h: 2, static: false }));

export default function DashboardGrid({ stats, loading }: Props) {
  const [currentLayout, setCurrentLayout] = useState(layout);

  return (
    <GridLayout className="layout" layout={currentLayout} width={1200} gridConfig={{ cols: 6, rowHeight: 80 }} dragConfig={{ enabled: true }} resizeConfig={{ enabled: true }} compactor={getCompactor("vertical")} onLayoutChange={(l) => setCurrentLayout([...l])}>
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className="bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <div className={"p-2 rounded-lg " + card.color}><Icon size={20} className="text-white" /></div>
            </div>
            <span className="text-3xl font-bold text-gray-900">{loading ? "..." : (stats?.[card.key] ?? 0)}</span>
          </div>
        );
      })}
    </GridLayout>
  );
}
