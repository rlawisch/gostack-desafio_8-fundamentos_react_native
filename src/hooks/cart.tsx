import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem('@Desafio8:Products');
      if (storedProducts) setProducts(JSON.parse(storedProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const foundProduct = products.find(
        filteredProduct => filteredProduct.id === product.id,
      );
      let modifiedProducts;

      if (foundProduct) {
        modifiedProducts = products.map(prod =>
          prod.id === product.id
            ? { ...product, quantity: prod.quantity + 1 }
            : prod,
        );
      } else modifiedProducts = [...products, { ...product, quantity: 1 }];

      setProducts(modifiedProducts);

      await AsyncStorage.setItem(
        '@Desafio8:Products',
        JSON.stringify(modifiedProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const foundProduct = products.find(
        filteredProduct => filteredProduct.id === id,
      );
      if (!foundProduct) return;

      const modifiedProducts = products.map(filteredProduct =>
        filteredProduct.id === id
          ? { ...foundProduct, quantity: foundProduct.quantity + 1 }
          : filteredProduct,
      );

      setProducts(modifiedProducts);

      await AsyncStorage.setItem(
        '@Desafio8:Products',
        JSON.stringify(modifiedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const foundProduct = products.find(
        filteredProduct => filteredProduct.id === id,
      );
      if (!foundProduct || foundProduct.quantity === 0) return;

      const modifiedProducts = products.map(filteredProduct =>
        filteredProduct.id === id
          ? { ...foundProduct, quantity: foundProduct.quantity - 1 }
          : filteredProduct,
      );

      setProducts(modifiedProducts);

      await AsyncStorage.setItem(
        '@Desafio8:Products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
