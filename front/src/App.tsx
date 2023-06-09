import { useState } from "react";
import { RelayProvider } from "@opengsn/provider";
import { BrowserProvider, ethers } from "ethers";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

import testContract from "./testContract.json";
import E_paymasterABI from "./TestEverythingPaymaster.json";
import S_paymasterABI from "./TestSinglePaymaster.json";

function App() {
  const [contract, setContract] = useState<any>();
  const [contractA, setContractA] = useState<any>();
  const [paymaster, setPaymaster] = useState<any>();
  const [paymasterBalance, setPaymasterBalance] = useState("");
  const [paymasterType, setPaymasterType] = useState("");
  const [type, setType] = useState("");
  const [gsnConfig, setGsnConfig] = useState<any>();
  const web3 = new Web3(window.ethereum);
  const web3Provider = window.ethereum;

  // E : EverythingPaymaster
  // S : SinglePaymaster
  const payMaster_E_address = "0xfA409d63b423bc3a9B89e4f3aC34f87CE9804e11";
  const payMaster_S_address = "0xD090f91a0846B33a7094bEA3715c0BD41A28474a";

  const Instance_E = new web3.eth.Contract(
    E_paymasterABI.abi as AbiItem[],
    payMaster_E_address
  );

  const Instance_S = new web3.eth.Contract(
    S_paymasterABI.abi as AbiItem[],
    payMaster_S_address
  );
  // contract내용은 동일
  const relayHub = "0x3232f21A6E08312654270c78A773f00dd61d60f5";
  const forwarder = "0xB2b5841DBeF766d4b521221732F9B618fCf34A87";
  const targetAddress = "0xBb48cB41C05C8759496fbAe115b8B612A8272C2c";
  const targetAddress_S = "0xA4194F21aC152cD7259A426c3e20a84b68e39EdD";
  // paymaster, target 배포 address : 0x5Ec22166058614fBC16AF01E400bE3f22B467759
  const MetaMaskProvider = new BrowserProvider(web3Provider);

  const wallet_MetaMask = new ethers.Wallet(
    "fd9a5346813a30c948c934648ef9999ef95cdea977aee4c614c672518735e6b3",
    MetaMaskProvider
  );

  let gsnRelayProvider_E: RelayProvider;
  let gsnRelayProvider_S: RelayProvider;
  let theContract_E: any;
  let theContract_S: any;
  let signer;
  const setsetPaymasterToEveryting = () => {
    setPaymasterType("Everything");
    setPaymaster(payMaster_E_address);
    setGsnConfigFunc(payMaster_E_address);
  };
  const setsetPaymasterToSingle = () => {
    setPaymasterType("Single");
    setPaymaster(payMaster_S_address);
    setGsnConfigFunc(payMaster_S_address);
  };
  const setGsnConfigFunc = (address: string) => {
    setGsnConfig({
      loggerConfiguration: { logLevel: "debug" },
      paymasterAddress: address,
    });
  };

  const setContract_E = async () => {
    try {
      gsnRelayProvider_E = await RelayProvider.newWeb3Provider({
        provider: web3Provider, //web3Provider = window.ethereum이기때문에 metamask에서 signer를 얻어오는 것으로 추즉
        config: gsnConfig,
      });

      const gsnProvider_E = new BrowserProvider(gsnRelayProvider_E);
      signer = await gsnProvider_E.getSigner();
      theContract_E = new ethers.Contract(
        targetAddress,
        testContract.abi,
        signer
      );
      setType("Single 등록 X");
      setContractA(targetAddress);
      setContract(theContract_E);
    } catch (e) {
      console.error(e);
    }
  };
  const setContract_S = async () => {
    try {
      gsnRelayProvider_S = await RelayProvider.newWeb3Provider({
        provider: web3Provider,
        config: gsnConfig,
      });

      const gsnProvider_S = new BrowserProvider(gsnRelayProvider_S);
      signer = await gsnProvider_S.getSigner();
      theContract_S = new ethers.Contract(
        targetAddress_S,
        testContract.abi,
        signer // wallet선언 시 사용한 provider에 따라 어느 node를 통하여 트랜잭션을 배포할 것인지 정해진다.
      );
      setType("Single 등록된 O");
      setContractA(targetAddress_S);
      setContract(theContract_S);
    } catch (e) {
      console.error(e);
    }
  };
  const getPaymasterBalance = async () => {
    let result;
    switch (paymaster) {
      case payMaster_E_address:
        result = await Instance_E.methods.getBalance().call();
        break;
      case payMaster_S_address:
        result = await Instance_S.methods.getBalance().call();
        break;
    }
    setPaymasterBalance(result);
  };
  const testTransaction = async (methodName: string) => {
    let result;
    try {
      switch (methodName) {
        case "up":
          result = await contract?.up({});
          break;
        case "down":
          result = await contract?.down({});
          break;
        case "get":
          result = await contract?.getNumber({});
          break;
      }
      console.log(result);
      getPaymasterBalance();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="App">
      <div>relayHub : {relayHub}</div>
      <div>forwarder : {forwarder}</div>
      <div> paymaster address : {paymaster}</div>
      <div>type : {paymasterType}</div>
      <div>paymaster 잔액 : {paymasterBalance}</div>
      <div>Contract address : {contractA}</div>
      <div>{type}</div>
      <div>
        <h1>paymaster 변경</h1>
        <button
          onClick={() => {
            setsetPaymasterToEveryting();
          }}>
          paymaster를 Everything으로 변경
        </button>
        <button
          onClick={() => {
            setsetPaymasterToSingle();
          }}>
          paymaster를 Single로 변경
        </button>
        <button
          onClick={() => {
            getPaymasterBalance();
          }}>
          잔액 확인
        </button>
      </div>
      <div>
        <h1>contract변경</h1>
        <button
          onClick={() => {
            setContract_E();
          }}>
          contract를 Singlepaymaster에 등록하지 않은 contract로 변경
        </button>
        <button
          onClick={() => {
            setContract_S();
          }}>
          contract를 Singlepaymaster에 등록한 contract로 변경
        </button>
      </div>
      <div>
        <h1>transaction</h1>
        <button
          onClick={() => {
            testTransaction("up");
          }}>
          testUpTranscation
        </button>
        <button
          onClick={() => {
            testTransaction("down");
          }}>
          testDownTranscation
        </button>
        <button
          onClick={() => {
            testTransaction("get");
          }}>
          testGetTranscation
        </button>
      </div>
    </div>
  );
}

export default App;
