import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function Login() {
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [error, setError] = useState("")
    const { login, loading } = useAuth()
    const navigate = useNavigate()

    async function handleLogin(e) {
      e.preventDefault()
      setError("")
      try {
        await login({ email, senha })
        navigate("/")
      } catch (err) {
        console.error(err)
        setError("Credenciais Inválidas")
      }
    }

    return (
    <form onSubmit={handleLogin} className="p-4 max-w-sm mx-auto flex flex-col gap-3">
      <h1 className="text-xl font-bold">Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border px-2 py-1 rounded"
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
        className="border px-2 py-1 rounded"
      />
      <button type="submit" className="bg-blue-500 text-white py-1 rounded disabled:opacity-60" disabled={loading}>
        {loading ? 'Carregando...' : 'Entrar'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
    )
}