import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface CaptainCardProps {
  name: string;
  role: string;
  image: string;
  teamColor: string;
  index: number;
  teamName?: string;
  price?: number;
  isSold?: boolean;
}

const CaptainCard = ({ name, role, image, teamColor, index, teamName, price, isSold }: CaptainCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.7, rotateY: 90 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      transition={{
        delay: 0.8 + index * 0.3,
        duration: 0.7,
        type: "spring",
        stiffness: 90,
        damping: 14,
      }}
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { duration: 0.25 },
      }}
      className="relative group cursor-pointer w-full h-full"
    >
      {/* Glow behind card */}
      <motion.div
        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `linear-gradient(135deg, ${teamColor}, transparent)` }}
        animate={{ opacity: [0.05, 0.2, 0.05] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative bg-slate-900/90 border border-slate-700/60 rounded-lg sm:rounded-xl overflow-hidden w-full h-full flex flex-col group-hover:border-emerald-500/40 transition-all duration-500 shadow-lg shadow-black/40">
        {/* Captain badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.2 + index * 0.3, type: "spring", stiffness: 200 }}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20"
        >
          <div className="bg-amber-400 rounded-full p-1 sm:p-1.5 shadow-lg shadow-amber-900/50">
            <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-950 stroke-[2.5]" />
          </div>
        </motion.div>

        {/* Player image — fills available space dynamically */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 z-10"
            style={{
              background: `linear-gradient(to top, rgba(15,23,42,1) 0%, transparent 40%, ${teamColor}15 100%)`,
            }}
          />
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
        </div>

        {/* Info — compact, fixed-height */}
        <div className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 text-center relative flex-shrink-0 bg-slate-900">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              background: `radial-gradient(circle at center bottom, ${teamColor}, transparent 70%)`,
            }}
          />
          <motion.h3
            className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black tracking-wider text-white uppercase relative z-10 truncate leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 + index * 0.3 }}
          >
            {name}
          </motion.h3>
          <motion.p
            className="text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.2em] text-slate-400 uppercase relative z-10 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 + index * 0.3 }}
          >
            {role}
          </motion.p>

          {/* Sold info or decorative dots */}
          {isSold && teamName && price ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-1 sm:mt-1.5 bg-slate-800/80 rounded py-0.5 px-1.5 sm:py-1 sm:px-2 relative z-10 inline-flex items-center gap-1 sm:gap-2"
            >
              <span className="text-[8px] sm:text-[10px] md:text-xs font-bold truncate" style={{ color: teamColor }}>{teamName}</span>
              <span className="text-[8px] sm:text-[10px] md:text-xs text-amber-400 font-bold whitespace-nowrap">₹{price}L</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex justify-center gap-1 mt-1 sm:mt-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9 + index * 0.3 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CaptainCard;
