
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ProgressCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: string;
  className?: string;
}

const ProgressCard = ({ title, value, icon, color = "blue", trend, className }: ProgressCardProps) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: "hover:shadow-blue-500/20 hover:border-blue-500/50",
      green: "hover:shadow-green-500/20 hover:border-green-500/50",
      yellow: "hover:shadow-yellow-500/20 hover:border-yellow-500/50",
      purple: "hover:shadow-purple-500/20 hover:border-purple-500/50",
      red: "hover:shadow-red-500/20 hover:border-red-500/50",
      cyan: "hover:shadow-cyan-500/20 hover:border-cyan-500/50"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className={`bg-[#121212] border-slate-700 transition-all duration-300 ${getColorClasses(color)} group cursor-pointer ${className || ''}`}>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            <div className="text-right">
              <p className="text-xs md:text-sm text-gray-400 font-medium">{title}</p>
              <p className="text-lg md:text-2xl font-bold text-white">{value}</p>
            </div>
          </div>
          {trend && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">{trend}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressCard;
