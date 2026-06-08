/* Gerador de payload PIX seguindo a especificação EMV do Banco Central do Brasil */

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function emv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

export interface PixOptions {
  chave: string;
  nome: string;
  cidade: string;
  valor?: number;
  descricao?: string;
  txid?: string;
}

export function gerarPixPayload(opts: PixOptions): string {
  const mai = emv('00', 'BR.GOV.BCB.PIX')
    + emv('01', opts.chave)
    + (opts.descricao ? emv('02', opts.descricao.slice(0, 72)) : '');

  const txid = (opts.txid ?? '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***';
  const adf  = emv('05', txid);

  let payload =
    emv('00', '01') +
    emv('01', '12') +
    emv('26', mai) +
    emv('52', '0000') +
    emv('53', '986') +
    (opts.valor != null ? emv('54', opts.valor.toFixed(2)) : '') +
    emv('58', 'BR') +
    emv('59', opts.nome.slice(0, 25).toUpperCase()) +
    emv('60', opts.cidade.slice(0, 15).toUpperCase()) +
    emv('62', adf) +
    '6304';

  return payload + crc16(payload);
}

// Configurações da empresa (editável conforme implantação real)
export const PIX_CONFIG = {
  chave:  'valisys@empresa.com.br',
  nome:   'VALISYS INDUSTRIAL',
  cidade: 'UBERLANDIA',
};
