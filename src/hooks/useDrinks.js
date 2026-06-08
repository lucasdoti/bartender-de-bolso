import localDrinks, { ibaOrder } from '../data/drinks';
import { useApp } from '../context/AppContext';

export function useDrinks() {
  const { extraDrinks = [] } = useApp();
  return [...localDrinks, ...extraDrinks];
}

export { ibaOrder };
