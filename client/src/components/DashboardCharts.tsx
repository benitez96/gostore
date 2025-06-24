import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
import { Select, SelectItem } from "@heroui/select";

interface ClientStatusData {
  status_id: number;
  status_name: string;
  client_count: number;
}

interface QuotaData {
  month: string;
  total_amount: number;
  amount_paid: number;
  amount_not_paid: number;
}

interface DashboardChartsProps {
  clientStatusData?: ClientStatusData[];
  quotaData?: QuotaData[];
  availableYears?: string[];
  selectedYear?: string;
  onYearChange?: (year: string) => void;
}

const COLORS = ['#17c964', '#f5a524', '#f31260'];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M ${sx} ${sy} L ${mx} ${my} L ${ex} ${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-sm font-medium">
        {value} clientes
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

export default function DashboardCharts({ 
  clientStatusData, 
  quotaData, 
  availableYears = [], 
  selectedYear, 
  onYearChange 
}: DashboardChartsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Validar que los datos estén disponibles (no undefined/null)
  if (clientStatusData === undefined || quotaData === undefined) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Datos para el gráfico de torta (estado de clientes)
  const pieData = clientStatusData
    .filter(item => item.client_count > 0)
    .map((item, index) => ({
      name: item.status_name,
      value: item.client_count,
      color: COLORS[index % COLORS.length]
    }));

  // Datos para el gráfico de barras apiladas (ingresos mensuales) - mostrar todo el año
  const barData = quotaData.map(month => ({
    month: new Date(month.month + '-01').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
    pagado: month.amount_paid,
    pendiente: month.amount_not_paid,
    total: month.total_amount
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(entry.value)}
                </span>
              </div>
            ))}
            <div className="border-t pt-1 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de torta - Estado de clientes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Estado de Clientes
        </h3>
        {pieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No hay datos de clientes disponibles</p>
          </div>
        )}
      </div>

      {/* Gráfico de barras apiladas - Ingresos mensuales */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ingresos Mensuales {selectedYear && `(${selectedYear})`}
          </h3>
          {/* Selector de año */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Año:
              </label>
              <Select
                selectedKeys={selectedYear ? [selectedYear] : []}
                onSelectionChange={(keys) => {
                  const year = Array.from(keys)[0] as string ?? availableYears[0];
                  onYearChange?.(year)
                }}
                className="w-24"
                size="sm"
              >
                {availableYears.map((year) => (
                  <SelectItem key={year}>
                    {year}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        </div>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('es-AR', { 
                    notation: 'compact', 
                    maximumFractionDigits: 1 
                  }).format(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="pagado" 
                stackId="a"
                fill="#17c964" 
                name="Pagado"
                radius={[0, 0, 4, 4]}
              />
              <Bar 
                dataKey="pendiente" 
                stackId="a"
                fill="#f5a524" 
                name="Pendiente"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No hay datos de cuotas disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
} 
