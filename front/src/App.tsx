import React, { useEffect, useState } from "react";
import { RelayProvider, GSNConfig } from "@opengsn/provider";
import { BrowserProvider, Contract, JsonRpcProvider, ethers } from "ethers";
import Web3 from "web3";

import testContract from "./testContract.json";

function App() {
  const [contractInfo, setContractInfo] = useState<any>();
  const web3 = new Web3(window.ethereum);
  const web3Provider = window.ethereum;
  const gsnConfig: Partial<GSNConfig> = {
    loggerConfiguration: { logLevel: "debug" },
    paymasterAddress: "0x583EAD13949d947c82988a55BAb1F559DB078003",
  };

  const provider1 = new JsonRpcProvider(
    "https://polygon-mumbai.g.alchemy.com/v2/2zk1l2CtjrKFai1toSAMQdjhmyT7vidI"
  );
  const provider2 = new BrowserProvider(web3Provider);
  let signer;
  let gsnProvider: RelayProvider;
  let theContract: any;
  const gsnInit = async () => {
    gsnProvider = await RelayProvider.newWeb3Provider({
      provider: web3Provider,
      config: gsnConfig,
    });

    const provider3 = new BrowserProvider(gsnProvider);
    signer = await provider3.getSigner();
    console.log(signer);
    theContract = new ethers.Contract(
      "0x0AEEB1DD930dc4e2087690515B9B6125F6766db5",
      testContract.abi,
      signer // wallet선언 시 사용한 provider에 따라 어느 node를 통하여 트랜잭션을 배포할 것인지 정해진다.
    );
  };
  const wallet = new ethers.Wallet(
    "fd9a5346813a30c948c934648ef9999ef95cdea977aee4c614c672518735e6b3",
    provider1
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
  // let signer;
  // let address;
  // let providers;
  // const signerInfo = async () => {
  //   signer = await provider2.getSigner();
  //   address = signer.address;
  //   providers = signer.provider;
  //   console.log(signer.provider);
  // };

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
        testTransaction
      </button>
      <button
        onClick={() => {
          gsnInit();
        }}>
        gsnInit
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
