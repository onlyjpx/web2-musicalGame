import { OAuth2Client } from 'google-auth-library'
import process from 'process'

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const cliente = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

export async function verificaGoogleToken(code){

    const { tokens } = await cliente.getToken({
        code: code,
        redirect_uri: REDIRECT_URI,
    });
    const idToken = tokens.id_token;

    const ticket = await cliente.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return{
        nome: payload.name,
        email: payload.email,
        picture: payload.picture,
        email_verified: payload.email_verified,
    };
}