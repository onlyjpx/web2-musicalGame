import { useEffect, useState } from 'react'
import axios from 'axios'
import { Howl } from 'howler'

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
      <h1 className="text-xl font-bold">Músicas</h1>
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
    </div>
  )
}

export default App
