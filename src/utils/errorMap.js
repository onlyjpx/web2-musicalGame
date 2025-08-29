const messages = {
  TITULO_OBRIGATORIO: 'Título é obrigatório.',
  GENERO_OBRIGATORIO: 'Gênero é obrigatório.',
  DUPLICATE_TITULO: 'Já existe um desafio com este título.',
  MUSICA_NOME_OBRIGATORIO: 'Informe o nome da música.',
  MUSICA_NAO_ENCONTRADA_DEEZER: 'Música não encontrada no Deezer.',
  MUSICA_DUPLICADA: 'Essa música já foi adicionada.',
  LIMITE_MUSICAS: 'Limite de músicas atingido.',
  DESAFIO_NAO_ENCONTRADO: 'Desafio não encontrado.',
};

export function mapApiError(err) {
  const code = err?.response?.data?.error?.code;
  if (code && messages[code]) return messages[code];
  return err?.response?.data?.error?.message || err?.response?.data?.error || 'Erro inesperado';
}
