import { useGoogleLogin } from "@react-oauth/google";
import BotaoAnimado from "./botaoAnimado";
import axios from 'axios'

export function LoginGoogleCustom() {
    const login = useGoogleLogin({
        flow: "auth-code",
        redirect_uri: 'http://localhost:5173',
        onSuccess: async (tokenResponse) => {
            try{
                console.log(tokenResponse);
                const response = await axios.post("http://localhost:3000/auth/google", {
                    code: tokenResponse.code,
                })

            console.log("Resposta backend: ", response.data);
            localStorage.setItem("token", response.data);
            }catch (error) {
                console.error("Erro no backend: ", error);
            }
        },
        onError: (error) => console.error("Login falou: ", error),
    });

    return (
        <BotaoAnimado
            onClick={() => login()}
            variant="primary"
            className="w-full"
        >
            Entrar com o Google
        </BotaoAnimado>
    )
}