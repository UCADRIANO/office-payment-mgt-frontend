import React, { useMemo, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Db } from "../interfaces";

interface DatabaseChartProps {
  data: Array<{
    db: Db;
    count: number;
  }>;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
];

export function DatabaseChart({ data }: DatabaseChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

    return data
      .filter((item) => item.count > 0 || total === 0) // Show all if total is 0, otherwise filter zeros
      .map((item) => ({
        name: item.db.short_code,
        value: item.count || 0,
        fullName: item.db.name,
        percentage: total > 0 ? ((item.count || 0) / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [data]);

  const totalPersonnel = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Database Personnel Overview
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No personnel data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold text-gray-900">{data.fullName}</p>
          <p className="text-blue-600 font-medium">
            Personnel: {data.value.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Database Personnel Overview</h3>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart */}
        <div
          className="flex-1 w-full"
          style={{ minHeight: "300px", height: "384px" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((_, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`gradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={COLORS[index % COLORS.length]}
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor={COLORS[index % COLORS.length]}
                      stopOpacity={0.7}
                    />
                  </linearGradient>
                ))}
              </defs>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({
                  name,
                  percent,
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                }: any) => {
                  if (
                    !percent ||
                    !midAngle ||
                    !cx ||
                    !cy ||
                    !innerRadius ||
                    !outerRadius
                  )
                    return null;

                  const RADIAN = Math.PI / 180;
                  const radius =
                    innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  // Only show label if percentage is >= 3%
                  if (percent < 0.03) return null;

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize={12}
                      fontWeight="bold"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={isMobile ? 80 : 120}
                innerRadius={isMobile ? 40 : 60}
                paddingAngle={4}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                animationBegin={0}
                animationDuration={800}
                stroke="#fff"
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#gradient-${index})`}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                formatter={(value, entry: any) => {
                  const data = chartData.find((d) => d.name === value);
                  return `${value} - ${data?.value.toLocaleString() || 0} (${
                    data?.percentage.toFixed(1) || 0
                  }%)`;
                }}
                iconType="circle"
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Database Personnel Summary List */}
        {data.length > 0 && (
          <div className="flex-1 lg:max-w-md">
            <h4 className="text-md font-semibold mb-3">
              Database Personnel Summary
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data
                .sort((a, b) => (b.count || 0) - (a.count || 0))
                .map((item) => {
                  const chartItem = chartData.find(
                    (c) => c.name === item.db.short_code
                  );
                  return (
                    <div
                      key={item.db.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.db.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.db.short_code}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {item.count.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {chartItem
                            ? `${chartItem.percentage.toFixed(1)}%`
                            : "0%"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
