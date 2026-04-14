import { createContext, useContext } from 'react';

interface ListSchemasContextValue {
  data: object;
}

const ListSchemasContext = createContext<ListSchemasContextValue | null>(null);

export const ListSchemasProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ListSchemasContext.Provider value={{ data: {} }}>
      {children}
    </ListSchemasContext.Provider>
  );
};

export const useListSchemasContext = () => {
  const context = useContext(ListSchemasContext);
  if (!context) {
    throw new Error(
      'useListSchemasContext must be used within a ListSchemasProvider',
    );
  }
  return context;
};
