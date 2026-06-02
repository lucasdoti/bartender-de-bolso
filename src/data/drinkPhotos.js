const BASE = 'https://gryjztelmvmyxbixtgqc.supabase.co/storage/v1/object/public/drink-photos';

// Retorna a URL da foto do drink pelo ID.
// Quando o bucket estiver populado, basta fazer upload de "{id}.jpg".
const drinkPhotos = new Proxy({}, {
  get: (_, id) => `${BASE}/${id}.jpg`,
});

export default drinkPhotos;
