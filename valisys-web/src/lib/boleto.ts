/* Gerador de boleto bancário simulado — estrutura FEBRABAN / Itaú (341) */

function mod10(num: string): number {
  let sum = 0, mult = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    let r = parseInt(num[i]) * mult;
    if (r > 9) r -= 9;
    sum += r;
    mult = mult === 2 ? 1 : 2;
  }
  const rem = sum % 10;
  return rem === 0 ? 0 : 10 - rem;
}

function mod11(num: string): string {
  let sum = 0, mult = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    sum += parseInt(num[i]) * mult;
    mult = mult >= 9 ? 2 : mult + 1;
  }
  const rem = sum % 11;
  return rem < 2 ? '1' : String(11 - rem);
}

export interface BoletoOptions {
  contaId: string;
  beneficiario: { nome: string; cnpj: string; cidade: string };
  pagador: { nome: string; cpfCnpj: string; endereco?: string };
  valor: number;
  dataVencimento: Date;
  dataEmissao: Date;
  descricao: string;
  instrucoes?: string[];
}

export interface BoletoData extends BoletoOptions {
  linhaDigitavel: string;
  codigoBarras44: string;
  nossoNumero: string;
  banco: { codigo: string; nome: string; agencia: string; conta: string };
}

export function gerarBoleto(opts: BoletoOptions): BoletoData {
  const banco = { codigo: '341', nome: 'Itaú Unibanco S.A. (simulado)', agencia: '3003', conta: '99999' };

  // nosso número derivado do contaId (8 dígitos)
  const nossoNum = opts.contaId
    .replace(/[^0-9a-f]/gi, '')
    .split('')
    .map(c => (isNaN(parseInt(c)) ? c.charCodeAt(0) % 10 : parseInt(c)))
    .join('')
    .padEnd(8, '0')
    .slice(0, 8);

  // Fator vencimento: dias desde 07/10/1997
  const epoch = new Date(1997, 9, 7).getTime();
  const fatorVenc = Math.max(1000, Math.min(9999, Math.floor((opts.dataVencimento.getTime() - epoch) / 86400000)));

  const valorStr = Math.round(Math.abs(opts.valor) * 100).toString().padStart(10, '0');

  // Campo livre (25 chars) — formato simplificado Itaú
  const freeField = (banco.agencia + nossoNum + banco.conta + '00000000').slice(0, 25);

  // Barcode sem dígito verificador (43 chars: bank+currency + expiry+value+free)
  const semDig = banco.codigo + '9' + fatorVenc.toString().padStart(4, '0') + valorStr + freeField;
  const digVerif = mod11(semDig);

  // Barcode final (44 chars) — dígito verificador na posição 5 (índice 4)
  const codigoBarras44 = semDig.slice(0, 4) + digVerif + semDig.slice(4);

  // Linha digitável (blocos)
  const b1d = codigoBarras44.slice(0, 4) + codigoBarras44.slice(19, 24);
  const b1  = b1d + mod10(b1d);
  const b1f = b1.slice(0, 5) + '.' + b1.slice(5);

  const b2d = codigoBarras44.slice(24, 34);
  const b2  = b2d + mod10(b2d);
  const b2f = b2.slice(0, 5) + '.' + b2.slice(5);

  const b3d = codigoBarras44.slice(34, 44);
  const b3  = b3d + mod10(b3d);
  const b3f = b3.slice(0, 5) + '.' + b3.slice(5);

  const linhaDigitavel = `${b1f} ${b2f} ${b3f} ${digVerif} ${codigoBarras44.slice(5, 19)}`;

  return {
    ...opts,
    linhaDigitavel,
    codigoBarras44,
    nossoNumero: nossoNum,
    banco,
    instrucoes: opts.instrucoes ?? [
      'Não receber após o vencimento.',
      'Pagável em qualquer banco ou lotérica até o vencimento.',
      'Após vencimento cobrar multa de 2% + juros de 1% a.m.',
    ],
  };
}

// I25 barcode — retorna array de larguras de barras alternando preta/branca
const I25: Record<string, number[]> = {
  '0':[1,1,3,3,1],'1':[3,1,1,1,3],'2':[1,3,1,1,3],'3':[3,3,1,1,1],
  '4':[1,1,3,1,3],'5':[3,1,3,1,1],'6':[1,3,3,1,1],'7':[1,1,1,3,3],
  '8':[3,1,1,3,1],'9':[1,3,1,3,1],
};

export function i25Bars(code: string): { x: number; w: number }[] {
  const N = 2, W = 5;
  const elems: { w: number; bar: boolean }[] = [];

  // start: NNNN
  [N, N, N, N].forEach((w, i) => elems.push({ w, bar: i % 2 === 0 }));

  const s = code.length % 2 !== 0 ? '0' + code : code;
  for (let i = 0; i < s.length; i += 2) {
    const d1 = I25[s[i]]   ?? [1,1,1,1,1];
    const d2 = I25[s[i+1]] ?? [1,1,1,1,1];
    for (let j = 0; j < 5; j++) {
      elems.push({ w: d1[j] === 3 ? W : N, bar: true });
      elems.push({ w: d2[j] === 3 ? W : N, bar: false });
    }
  }

  // end: W N N (wide bar, narrow space, narrow bar)
  [W, N, N].forEach((w, i) => elems.push({ w, bar: i % 2 === 0 }));

  const rects: { x: number; w: number }[] = [];
  let x = 0;
  for (const el of elems) {
    if (el.bar) rects.push({ x, w: el.w });
    x += el.w;
  }
  return rects;
}

export function i25Width(code: string): number {
  const N = 2, W = 5;
  let total = 4; // start
  const s = code.length % 2 !== 0 ? '0' + code : code;
  for (let i = 0; i < s.length; i += 2) {
    const d1 = I25[s[i]]   ?? [1,1,1,1,1];
    const d2 = I25[s[i+1]] ?? [1,1,1,1,1];
    for (let j = 0; j < 5; j++) {
      total += (d1[j] === 3 ? W : N) + (d2[j] === 3 ? W : N);
    }
  }
  total += W + N + N; // end
  return total;
}

// Configuração da empresa emissora
export const BOLETO_CONFIG = {
  beneficiario: {
    nome: 'Valisys Industrial Ltda.',
    cnpj: '00.000.000/0001-00',
    cidade: 'UBERLÂNDIA - MG',
    endereco: 'Av. Industrial, 1000 — Uberlândia/MG',
  },
};
