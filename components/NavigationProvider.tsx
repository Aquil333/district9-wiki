"use client";

import { createContext, useContext } from 'react';

interface NavCategory {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  parentId?: string | null;
  children?: NavCategory[];
}

interface NavigationContextType {
  categories: NavCategory[];
}

const NavigationContext = createContext<NavigationContextType>({
  categories: []
});

export const useNavigation = () => useContext(NavigationContext);

export function NavigationProvider({ 
  children, 
  categories 
}: { 
  children: React.ReactNode;
  categories: NavCategory[];
}) {
  return (
    <NavigationContext.Provider value={{ categories }}>
      {children}
    </NavigationContext.Provider>
  );
}