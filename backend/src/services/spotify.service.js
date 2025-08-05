import axios from "axios";

let spotifyToken = null;
let tokenExpiracao = 0;

export async function getSpotifyToken() {
  const agora = Date.now();
  if (spotifyToken && agora < tokenExpiracao) {
    return spotifyToken;
  }

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  spotifyToken = response.data.access_token;
  tokenExpiracao = agora + response.data.expires_in * 1000;
  return spotifyToken;
}
