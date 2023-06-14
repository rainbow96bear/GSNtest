import { useState, useEffect } from "react";
import { RelayProvider, GSNConfig } from "@opengsn/provider";
import { BrowserProvider, ethers } from "ethers";
import Web3 from "web3";

import abi from "../abi/RubixProject";

const ProjectTest = () => {
  const paymasterCA = "0xeFBE438bF4bF279759C255Fb19eD1EB46FeAe470";
  const projectCA = "0x73855f22A13efbAC9E94B2D3BDfCebe5D6210a2b";
  const sampleTokenCA = "0xA3419F30F02aE34A1E377D2829dfdCE35F08c76c";

  const web3 = new Web3(window.ethereum);
  const web3Provider = window.ethereum;

  const gsnConfig: Partial<GSNConfig> = {
    loggerConfiguration: { logLevel: "debug" },
    paymasterAddress: paymasterCA,
  };

  const [leader, setLeader] = useState("");
  const [frontLeader, setfrontLeader] = useState();
  const [theContract, setTheContract] = useState<any>();

  const hireLeader = async () => {
    await theContract?.hireLeader(leader);
    const leadAddress = await theContract?.hireLeader();
    setfrontLeader(leadAddress);
  };
  const fireLeader = async () => {
    await theContract?.fireLeader();
    const leadAddress = await theContract?.lead();
    setfrontLeader(leadAddress);
  };
  const contractSet = async () => {
    const gsnRelayProvider = await RelayProvider.newWeb3Provider({
      provider: web3Provider,
      config: gsnConfig,
    });
    const GsnProvider = new BrowserProvider(gsnRelayProvider);
    const signer = await GsnProvider.getSigner();
    const contract = new ethers.Contract(projectCA, abi, signer);
    setTheContract(contract);
  };
  useEffect(() => {
    const getLeader = async () => {
      const leadAddress = await theContract?.lead();
      setfrontLeader(leadAddress);
    };
    getLeader();
  }, []);
  return (
    <div>
      <h2>paymaster : {paymasterCA}</h2>
      <h2>project : {projectCA}</h2>
      <div>
        <h3>lead : {frontLeader}</h3>
      </div>
      <div>
        <button
          onClick={() => {
            contractSet();
          }}>
          시작
        </button>
      </div>
      <div>
        <input
          type="text"
          onChange={(e) => {
            e.preventDefault();
            setLeader(e.target.value);
          }}
        />
        <button
          onClick={() => {
            hireLeader();
          }}>
          hireLeader
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            fireLeader();
          }}>
          fireLeader
        </button>
      </div>
      <div>
        <button>startProject</button>
      </div>
      <div>
        <button>completeProject</button>
      </div>
      <div>
        <button>approveProject</button>
      </div>
      <div>
        <input type="text" />
        <input type="text" />
        <button>addTask</button>
      </div>
      <div>
        <input type="text" />
        <input type="text" />
        <button>assignTask</button>
      </div>
      <div>
        <input type="text" />
        <button>cancelTask</button>
      </div>
      <div>
        <input type="text" />
        <button>startTask</button>
      </div>
      <div>
        <input type="text" />
        <button>completeTask</button>
      </div>
      <div>
        <input type="text" />
        <button>approveTask</button>
      </div>
    </div>
  );
};

export default ProjectTest;
