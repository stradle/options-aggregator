import { ConnectButton } from "@rainbow-me/rainbowkit";

const Wallet = () => {
  return <ConnectButton showBalance={false} chainStatus={"none"} />;
};

export default Wallet;
