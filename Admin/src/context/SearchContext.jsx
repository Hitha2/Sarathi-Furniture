import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <SearchContext.Provider value={{ globalSearch, setGlobalSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);