import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Registrar() {
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [nome, setNome] = useState("")
    const [error, setError] = useState("")

    async function handleRegistro(e) {
        e.preventDefault()
        
    }

}