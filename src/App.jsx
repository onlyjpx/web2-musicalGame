import { useEffect, useState } from 'react'
import axios from 'axios'
import { LoginGoogleCustom } from './components/googleLogin'
import { Howl } from 'howler'
import { motion as _m } from 'motion/react'

function App() {
  const [musicas, setMusicas] = useState([])
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    axios.get("http://localhost:3000/desafio-musica/4")
      .then(response => setMusicas(response.data))
      .catch(error => console.error("Erro:", error))
  }, [])

  const tocarPreview = (url) => {
    if (player) {
      player.stop()
    }
    const som = new Howl({ src: [url] })
    som.play()
    setPlayer(som)
  }

  return (
    <div className="p-4">
      <_m.div 
        initial = {{ opacity: 0 }}
        animate = {{ opacity: 1 }}
      >
        <h1>Musicas</h1>
      </_m.div>
      <ul className="space-y-4">
        {musicas.map(musica => (
          <li key={musica.deezerId} className="border p-4 rounded shadow">
            <p><strong>{musica.titulo}</strong> - {musica.artista}</p>
            <button
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
              onClick={() => tocarPreview(musica.preview)}
            >
              ▶️ Tocar preview
            </button>
          </li>
        ))}
      </ul>
      <div>
        <h1>Teste do login google</h1>
        <LoginGoogleCustom />
      </div>
    </div>
  )
}

export default App
