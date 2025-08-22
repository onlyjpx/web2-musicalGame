import { motion as _m } from "motion/react";
import { useState } from "react";
import { Loader2, Check, X } from "lucide-react";

const estados = {
  idle: { cor: "#007AFF" },     // azul iOS
  loading: { cor: "#007AFF" },
  success: { cor: "#34C759" },  // verde iOS
  error: { cor: "#FF3B30" },    // vermelho iOS
};

export default function BotaoAnimado({
  mensagens = {
    idle: "Enviar",
    loading: "Processando...",
    success: "Concluído!",
    error: "Algo deu errado",
  },
  icones = {
    idle: null,
    loading: <Loader2 className="w-4 h-4 animate-spin" />,
    success: <Check className="w-3 h-3" />,
    error: <X className="w-4 h-4" />,
  },
  onClick,
}) {
  const [estado, setEstado] = useState("idle");

  async function handleClick() {
    if (onClick) {
      setEstado("loading");
      try {
        await onClick();
        setEstado("success");
      } catch (err) {
        setEstado("error", err);
      }
    }
  }

  return (
    <_m.button
      layout
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-md text-white"
      animate={{ backgroundColor: estados[estado].cor }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      whileTap={{ scale: 0.97 }}
    >
      <_m.span layout className="flex items-center gap-2">
        {icones[estado]}
        {mensagens[estado]}
      </_m.span>
    </_m.button>
  );
}
