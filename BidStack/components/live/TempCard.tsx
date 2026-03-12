import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { formatPriceCompact } from "@/lib/utils";

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
      initial={{ opacity: 0, y: 100, scale: 0.5, rotateY: 90 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      transition={{
        delay: 1.5 + index * 0.4,
        duration: 0.8,
        type: "spring",
        stiffness: 80,
        damping: 15,
      }}
      whileHover={{
        scale: 1.08,
        y: -16,
        transition: { duration: 0.3 },
      }}
      className="relative group cursor-pointer"
    >
      {/* Glow behind card */}
      <motion.div
        className="absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `linear-gradient(135deg, ${teamColor}, transparent)` }}
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative bg-card border border-border rounded-2xl overflow-hidden w-full box-glow-primary group-hover:box-glow-accent transition-shadow duration-500">
        {/* Captain badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 2 + index * 0.4, type: "spring", stiffness: 200 }}
          className="absolute top-3 right-3 z-20"
        >
          <div className="bg-accent rounded-full p-2 box-glow-accent">
            <Crown className="w-5 h-5 text-accent-foreground" />
          </div>
        </motion.div>

        {/* Player image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.div
            className="absolute inset-0 z-10"
            style={{
              background: `linear-gradient(to top, hsl(var(--card)) 0%, transparent 50%, ${teamColor}22 100%)`,
            }}
          />
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-contain object-top"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Animated border line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: teamColor }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.2 + index * 0.4, duration: 0.6 }}
          />
        </div>

        {/* Info */}
        <div className="p-5 text-center relative">
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at center bottom, ${teamColor}, transparent 70%)`,
            }}
          />
          <motion.h3
            className="font-display text-lg font-bold tracking-wider text-foreground relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4 + index * 0.4 }}
          >
            {name}
          </motion.h3>
          <motion.p
            className="font-display text-xs tracking-[0.3em] text-muted-foreground mt-1 uppercase relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 + index * 0.4 }}
          >
            {role}
          </motion.p>

          {/* Sold info or decorative dots */}
          {isSold && teamName && price ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 bg-secondary rounded-lg py-1.5 px-3 relative z-10"
            >
              <span className="font-display text-xs" style={{ color: teamColor }}>{teamName}</span>
              <span className="font-display text-xs text-accent ml-2" style={{ color: teamColor }}> {formatPriceCompact(price)}</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex justify-center gap-1.5 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 + index * 0.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
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
