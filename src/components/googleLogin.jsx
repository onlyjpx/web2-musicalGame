import { useState } from 'react';
import { motion as _m, AnimatePresence } from 'motion/react';
import { useGoogleLogin } from "@react-oauth/google";
import BotaoAnimado from "./botaoAnimado";
import axios from 'axios'

export function LoginGoogleCustom() {
    const [finalizou, setFinalizou] = useState(false);
    const [mostrarBotao, setMostrarBotao] = useState(true);
    
    const login = useGoogleLogin({
        flow: "auth-code",
        redirect_uri: 'http://localhost:5173',
        onSuccess: async (tokenResponse) => {
            try {
                const response = await axios.post("http://localhost:3000/auth/google", {
                    code: tokenResponse.code,
                })

                const { token, nome } = response.data
                localStorage.setItem("token", JSON.stringify(token, nome));
                setFinalizou(true);

                setTimeout(() => {
                    setMostrarBotao(false);
                }, 1200);
            } catch (error) {
                console.error("Erro no backend: ", error);
            }
        },
        onError: (error) => console.error("Login falhou: ", error),
    });

    return (
        <AnimatePresence>
          {mostrarBotao && (
            <_m.div
              initial={{ clipPath: "circle(100% at 50% 50%)", opacity: 1 }}
              animate={{ clipPath: "circle(100% at 50% 50%)", opacity: 1 }}
              exit={{ clipPath: "circle(0% at 50% 50%)", opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <BotaoAnimado
                onClick={() => login()}
                mensagens={{
                  idle: "Entrar com o Google",
                  loading: "Conectando...",
                  success: finalizou ? "Conectado" : "Conectando...",
                  error: "Erro no login",
                }}
              />
            </_m.div>
          )}
        </AnimatePresence>
    );
}
