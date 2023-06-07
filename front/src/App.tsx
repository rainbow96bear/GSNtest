import React, { useEffect, useState } from "react";

import { Contract, ethers, BrowserProvider, EventFilter, Signer } from "ethers";
import Web3 from "web3";

import testContract from "./testContract.json";
import { prototype } from "events";

function App() {
  const [walletInfo, setWalletInfo] = useState<any>();
  const [contractInfo, setContractInfo] = useState<any>();
  const web3 = new Web3(window.ethereum);
  const web3Provider = window.ethereum;

  const provider1 = new ethers.JsonRpcProvider(
    "https://polygon-mumbai.g.alchemy.com/v2/2zk1l2CtjrKFai1toSAMQdjhmyT7vidI"
  );
  const provider2 = new ethers.BrowserProvider(web3Provider);
  const wallet = new ethers.Wallet(
    "fd9a5346813a30c948c934648ef9999ef95cdea977aee4c614c672518735e6b3",
    provider1
  );
  const theContract = new ethers.Contract(
    "0x0AEEB1DD930dc4e2087690515B9B6125F6766db5",
    testContract.abi,
    wallet // wallet선언 시 사용한 provider에 따라 어느 node를 통하여 트랜잭션을 배포할 것인지 정해진다.
  );
  const testTranscation = async () => {
    // console.log(wallet.address);
    const result = await web3.eth.getBalance(wallet.address);
    console.log(result);
    const result1 = await theContract.up({});
    const number1 = await theContract.getNumber();
    console.log(result1);
    console.log(number1);
    // const result2 = await theContract.down();
    // const number2 = await theContract.getNumber();
    // console.log(result2);
    // console.log(number2);
  };
  let signer;
  let address;
  let providers;
  const test = async () => {
    signer = await provider2.getSigner();
    address = signer.address;
    providers = signer.provider;
    console.log(signer.provider);
  };

  test();
  useEffect(() => {
    setContractInfo(theContract);
    // console.log("web3Provider", web3Provider);
    // console.log("provider", provider2);
  }, []);
  return (
    <div className="App">
      <button
        onClick={() => {
          testTranscation();
        }}>
        여기
      </button>
      <div>
        <h1>theContract의 정보</h1>
        <div>{"CA : " + contractInfo?.target}</div>
        <div>
          {"runner address (signerWalletAddress) : " +
            contractInfo?.runner?.address}
        </div>
      </div>
    </div>
  );
}

export default App;
