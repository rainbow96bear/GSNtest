import { Provider } from "web3/providers";

declare global {
  interface Window {
    ethereum?: Provider;
  }
}
