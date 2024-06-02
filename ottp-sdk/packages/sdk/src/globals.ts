interface EthereumProvider {
    isMetaMask?: boolean;
    request: (...args: any[]) => Promise<any>;
    on?: (eventName: string, callback: (...args: any[]) => void) => void;
    removeListener?: (eventName: string, callback: (...args: any[]) => void) => void;
  }
  
  interface Window {
    ethereum?: EthereumProvider;
  }
  