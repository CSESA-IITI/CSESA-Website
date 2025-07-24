import React from "react";
import { motion } from "framer-motion";
import { getDiamondGridRows } from "./diamondLayout";

type Card = { id: number; title: string };

export const DiamondGrid: React.FC<{ cards: Card[] }> = ({ cards }) => {
  const rows = getDiamondGridRows(cards);

  return (
    <div className="flex flex-col items-center py-12 min-h-screen bg-gradient-to-b from-[#2b1945] to-[#222142]">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex justify-center space-x-6 my-2`}
          style={{ marginLeft: `${Math.abs(Math.floor(rows.length / 2) - i) * 6}rem` }} // adjust for diamond effect
        >
          {row.map(card => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: card.id * 0.05 }}
              className="bg-white/10 border border-violet-500 rounded-xl shadow-lg w-64 h-36 flex flex-col items-center justify-center text-white"
            >
              <div className="uppercase text-xs font-semibold tracking-[0.2em] opacity-70">
                Design Principle
              </div>
              <div className="mt-2 text-2xl font-bold">{card.title}</div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};
