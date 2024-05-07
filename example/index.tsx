import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  http,
  Address,
  Hash,
  TransactionReceipt,
  createPublicClient,
  createWalletClient,
  custom,
  stringify,
} from 'viem'
import { base } from 'viem/chains'
import 'viem/window'
//import {createAttestation}  from './utils'
import { OttpClient } from '@ottp/sdk'


function Example() {
  const ottp = new OttpClient()
  const [account, setAccount] = useState<Address>()
  const [hash, setHash] = useState<Hash>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()

  useEffect(() => {
    if (!window.ethereum) {
        console.error('MetaMask is not installed!');
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect.");
      return;    
    }
    try {
      const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(address);
    } catch (error) {
      console.error('Error on connecting: ', error);
    }
  }

  const attest = async () => {
    if (!account) return
    const msg = {"toFID":"367273","message":"We built the @ottp schema together!","project":["ottp"]}
    const tx = await ottp.createOttpAttestation(account, 316300, JSON.stringify(msg) )
    setHash(tx)
  }

  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  })

  useEffect(() => {
    ;(async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        setReceipt(receipt)
      }
    })()
  }, [hash])

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <button onClick={attest}>Attest</button>
        {receipt && (
          <>
            <div>
              Receipt:{' '}
              <pre>
                <code>{stringify(receipt, null, 2)}</code>
              </pre>
            </div>
          </>
        )}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
  <Example />
</React.StrictMode>
)
