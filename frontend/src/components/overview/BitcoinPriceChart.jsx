import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
  LineChart, Line, AreaChart, Area, PieChart, Pie, RadialBarChart, RadialBar,
  ComposedChart, ReferenceLine
} from "recharts";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

const BTC_MONTHLY_DATA = [
  { name: "Jan", price: 42150, volume: 2.1 },
  { name: "Feb", price: 45200, volume: 2.8 },
  { name: "Mar", price: 68000, volume: 4.2 },
  { name: "Apr", price: 63500, volume: 3.1 },
  { name: "May", price: 71000, volume: 5.3 },
  { name: "Jun", price: 65000, volume: 2.9 },
  { name: "Jul", price: 67000, volume: 3.7 },
  { name: "Aug", price: 61000, volume: 2.4 },
  { name: "Sep", price: 65000, volume: 3.9 },
  { name: "Oct", price: 71000, volume: 6.2 },
  { name: "Nov", price: 98000, volume: 8.1 },
  { name: "Dec", price: 95000, volume: 7.4 }
];

export const BitcoinPriceChart = () => {
  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">Bitcoin Price Trend 2024</h2>
      <div className="h-80">
        <ResponsiveContainer>
          <LineChart data={BTC_MONTHLY_DATA}>
            <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
            <XAxis dataKey='name' stroke='#9CA3AF' />
            <YAxis stroke='#9CA3AF' tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: "#10B981", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};