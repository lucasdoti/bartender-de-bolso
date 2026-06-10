import drinks, { ibaOrder } from '../data/drinks';

export function getDrinkOfDay(extraDrinks = []) {
  const all = [...drinks, ...extraDrinks];
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const ordered = [
    ...ibaOrder.map(id => all.find(d => d.id === id)).filter(Boolean),
    ...all.filter(d => !ibaOrder.includes(d.id)),
  ];
  return ordered[dayOfYear % ordered.length] || null;
}
