import { useState, useEffect, useCallback, useRef } from 'react';

export const RITUAL_CHAIN_ID = 1979;
export const RITUAL_CHAIN_ID_HEX = `0x${RITUAL_CHAIN_ID.toString(16)}`;

export const RITUAL_NETWORK = {
  chainId: RITUAL_CHAIN_ID_HEX,
  chainName: 'Ritual Testnet',
  nativeCurrency: {
    name: 'RITUAL',
    symbol: 'RITUAL',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ritualfoundation.org'],
  blockExplorerUrls: ['https://explorer.ritualfoundation.org'],
};

export type WalletStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'wrong_network'
  | 'error';

interface WalletState {
  status: WalletStatus;
  address: string | null;
  chainId: number | null;
  error: string | null;
}

function abbrev(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    status: 'disconnected',
    address: null,
    chainId: null,
    error: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const isRitual = useCallback((chainId: number | null) => {
    return chainId === RITUAL_CHAIN_ID;
  }, []);

  const computeStatus = useCallback(
    (address: string | null, chainId: number | null): WalletStatus => {
      if (!address) return 'disconnected';
      if (!isRitual(chainId)) return 'wrong_network';
      return 'connected';
    },
    [isRitual]
  );

  const updateFromProvider = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      const accounts: string[] = await ethereum.request({ method: 'eth_accounts' });
      const chainIdHex: string = await ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      const address = accounts[0] ?? null;

      setState({
        status: computeStatus(address, chainId),
        address,
        chainId,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Wallet error',
      }));
    }
  }, [computeStatus]);

  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'No wallet detected. Install MetaMask or a compatible wallet.',
      }));
      return;
    }

    setState(prev => ({ ...prev, status: 'connecting', error: null }));

    try {
      const accounts: string[] = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const chainIdHex: string = await ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      const address = accounts[0] ?? null;

      setState({
        status: computeStatus(address, chainId),
        address,
        chainId,
        error: null,
      });
    } catch (err) {
      setState({
        status: 'error',
        address: null,
        chainId: null,
        error: err instanceof Error ? err.message : 'Connection failed',
      });
    }
  }, [computeStatus]);

  const disconnect = useCallback(() => {
    setState({
      status: 'disconnected',
      address: null,
      chainId: null,
      error: null,
    });
  }, []);

  const switchToRitual = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: RITUAL_CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [RITUAL_NETWORK],
          });
        } catch (addError) {
          setState(prev => ({
            ...prev,
            error: 'Failed to add Ritual network to wallet.',
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          error: 'Failed to switch network.',
        }));
      }
    }
  }, []);

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      const current = stateRef.current;
      const address = accounts[0] ?? null;
      setState({
        status: computeStatus(address, current.chainId),
        address,
        chainId: current.chainId,
        error: null,
      });
    };

    const handleChainChanged = (chainIdHex: string) => {
      const current = stateRef.current;
      const chainId = parseInt(chainIdHex, 16);
      setState({
        status: computeStatus(current.address, chainId),
        address: current.address,
        chainId,
        error: null,
      });
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    updateFromProvider();

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [computeStatus, updateFromProvider]);

  return {
    ...state,
    isRitual,
    connect,
    disconnect,
    switchToRitual,
    abbrev: state.address ? abbrev(state.address) : '',
  };
}
