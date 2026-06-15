import { useContext } from 'react';
import { AskKyleContext } from './AskKyleProvider';

export function useAskKyle() {
  const context = useContext(AskKyleContext);
  if (!context) {
    throw new Error('useAskKyle must be used within an AskKyleProvider');
  }
  return context;
}
