import React, { createContext, useState, useCallback } from 'react';
import AskKyleModal from './AskKyleModal';

export const AskKyleContext = createContext(null);

export function AskKyleProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});

  const openAskKyle = useCallback((opts = {}) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeAskKyle = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AskKyleContext.Provider value={{ isOpen, openAskKyle, closeAskKyle, options }}>
      {children}
      <AskKyleModal isOpen={isOpen} onClose={closeAskKyle} options={options} />
    </AskKyleContext.Provider>
  );
}
