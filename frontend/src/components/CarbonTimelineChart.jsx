import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CarbonTimelineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">
        No timeline data available
      </p>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    carbon: parseFloat(item.carbon_kg.toFixed(2)),
    type: item.scan_type,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          label={{ value: "kg CO₂", angle: -90, position: "insideLeft" }}
        />
        <Tooltip formatter={(value) => `${value} kg CO₂`} />
        <Legend />
        <Line
          type="monotone"
          dataKey="carbon"
          stroke="#22c55e"
          strokeWidth={2}
          name="Carbon Emissions"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CarbonTimelineChart;