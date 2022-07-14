import { useAccount, useDisconnect, useNetwork } from "wagmi";
import { Button, styled } from "@mui/material";
import { shortenAddress } from "../services/util";
import { useWalletModal } from "./WalletModal";

const WalletButton = styled(Button)({
  borderRadius: "20px",
  variant: "outlined",
  textTransform: "none",
});

const Wallet = () => {
  const { address, connector: activeConnector } = useAccount();
  const { disconnect } = useDisconnect();
  // const { chain, chains } = useNetwork();
  const { walletModal, openModal } = useWalletModal();


  if (!activeConnector)
    return (
      <>
        <WalletButton
          variant="outlined"
          onClick={() => openModal()}
          style={{ textTransform: "none" }}>
          Connect
        </WalletButton>
        {walletModal}
      </>
    );

  return (
    <WalletButton variant="outlined" onClick={() => disconnect()}>
      {shortenAddress(address as string)}
    </WalletButton>
  );
};

export default Wallet;
