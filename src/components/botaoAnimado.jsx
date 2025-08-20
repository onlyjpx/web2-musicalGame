import { motion as _m } from 'motion/react'
import clsx from 'clsx';

export default function BotaoAnimado({
  children,
  onClick,
  className,
  variant = "primary",
}) {
  return (
    <_m.button
      onClick={onClick}
      className={clsx(
        "px-6 py-3 rounded-2xl font-semibold shadow-md relative overflow-hidden",
        variant === "primary" && "bg-blue-600 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-900",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <_m.span
        className="absolute inset-0 bg-white/20"
        initial={{ x: "-100%" }}
        whileHover={{ x: "0%" }}
        transition={{ duration: 0.4 }}
      />
      <span className="relative z-10">{children}</span>
    </_m.button>
  );
}


