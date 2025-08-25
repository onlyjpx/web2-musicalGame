import { useRef, useState } from 'react';
import { motion as _m, AnimatePresence } from 'motion/react';
import { useGoogleLogin } from "@react-oauth/google";
import BotaoAnimado from "./reusable/botaoAnimado";
import axios from 'axios'
import { useAuth } from '../hooks/useAuth';

export function LoginGoogleCustom() {
  const [finalizou, setFinalizou] = useState(false);
  const [mostrarBotao, setMostrarBotao] = useState(true);
  const [estadoBotao, setEstadoBotao] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const pendingAuthRef = useRef(null);

  // Configurações de tempo (ms)
  const SUCCESS_DISPLAY_MS = 800;    // tempo mostrando "Conectado"
  const EXIT_ANIM_MS = 400;          // duração da animação de saída
  const { applyAuth } = useAuth();
    
    const login = useGoogleLogin({
        flow: "auth-code",
        redirect_uri: 'http://localhost:5173',
        onSuccess: async (tokenResponse) => {
          try {
            const response = await axios.post("http://localhost:3000/auth/google", { code: tokenResponse.code });
            const { token, usuario } = response.data;
            // Guarda para aplicar após animação
            pendingAuthRef.current = { token, usuario };
            setFinalizou(true);
            setEstadoBotao('success');
            // Exibe sucesso, depois inicia saída, em seguida aplica auth
            setTimeout(() => {
              setMostrarBotao(false); // dispara exit animation
              setTimeout(() => {
                if (pendingAuthRef.current) {
                  const { token: tk, usuario: u } = pendingAuthRef.current;
                  applyAuth(tk, u);
                  pendingAuthRef.current = null;
                }
              }, EXIT_ANIM_MS);
            }, SUCCESS_DISPLAY_MS);
          } catch (error) {
            console.error("Erro no backend: ", error);
            setEstadoBotao('error');
          }
        },
        onError: (error) => { console.error("Login falhou: ", error); setEstadoBotao('error'); },
    });

    return (
        <AnimatePresence mode="sync">
          {mostrarBotao && (
            <_m.div
              key="google-btn-wrapper"
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -6 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <BotaoAnimado
                onClick={() => {
                  setEstadoBotao('loading');
                  // inicia fluxo google (não retorna promise de conclusão real)
                  login();
                }}
                state={estadoBotao}
                onStateChange={setEstadoBotao}
                autoResetMs={null}
                mensagens={{
                  idle: 'Entrar com o Google',
                  loading: 'Conectando...',
                  success: finalizou ? 'Conectado' : 'Conectando...',
                  error: 'Erro no login'
                }}
                variantClasses={{
                  idle: 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800',
                  loading: 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 cursor-wait',
                  success: 'bg-green-600 text-white hover:bg-green-500',
                  error: 'bg-red-600 text-white hover:bg-red-500'
                }}
                baseClasses="w-full justify-center rounded-xl font-medium"
              />
            </_m.div>
          )}
        </AnimatePresence>
    );
}
