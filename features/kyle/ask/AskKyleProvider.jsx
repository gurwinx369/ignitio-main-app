import React, { createContext, useState, useCallback } from 'react';
import AskKyleModal from './AskKyleModal';

export const AskKyleContext = createContext(null);

export function AskKyleProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});
  const [isThinking, setIsThinking] = useState(false);

  const openAskKyle = useCallback((opts = {}) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeAskKyle = useCallback(() => {
    setIsOpen(false);
    setIsThinking(false);
  }, []);

  return (
    <AskKyleContext.Provider value={{ isOpen, openAskKyle, closeAskKyle, options, isThinking, setIsThinking }}>
      {children}
      <AskKyleModal isOpen={isOpen} onClose={closeAskKyle} options={options} isThinking={isThinking} setIsThinking={setIsThinking} />
    </AskKyleContext.Provider>
  );
}
