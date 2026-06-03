const BASE = 'https://gryjztelmvmyxbixtgqc.supabase.co/storage/v1/object/public/drink-photos';

const drinkPhotos = new Proxy({}, {
  get: (_, id) => `${BASE}/${id}.jpg.jpeg`,
});

export default drinkPhotos;
