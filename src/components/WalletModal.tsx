import { Box, Button, Modal, Stack, styled, Typography } from "@mui/material";
import { useConnect } from "wagmi";
import { ComponentProps, useCallback, useState } from "react";

import MM from "../assets/wallets/mm.png";
import CBW from "../assets/wallets/cbw.png";
import WC from "../assets/wallets/wc.png";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
};

const StyledWalletButton = styled(Button)({
  gap: "0.5rem",
  textTransform: "none",
  img: { borderRadius: "3px" },
});
const WalletButton = (props: ComponentProps<typeof Button>) => (
  <StyledWalletButton {...props} fullWidth variant={"outlined"} />
);

function SelectWalletModal({ isOpen, closeModal }: { isOpen: boolean; closeModal: () => void }) {
  const { connect, connectors } = useConnect();

  return (
    <Modal open={isOpen} onClose={closeModal}>
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Select Wallet
        </Typography>
        <Stack sx={{ gap: "0.75rem" }}>
          <WalletButton
            onClick={() => {
              connect({ connector: connectors[0] });
              closeModal();
            }}>
            <img src={CBW} alt="Coinbase Wallet Logo" width={25} height={25} />
            <Typography>Coinbase Wallet</Typography>
          </WalletButton>
          <WalletButton
            onClick={() => {
              connect({ connector: connectors[1] });
              closeModal();
            }}>
            <img src={WC} alt="Wallet Connect Logo" width={26} height={26} />
            <Typography>Wallet Connect</Typography>
          </WalletButton>
          <WalletButton
            onClick={() => {
              connect({ connector: connectors[2] });
              closeModal();
            }}>
            <img src={MM} alt="Metamask Logo" width={25} height={25} />
            <Typography>Metamask</Typography>
          </WalletButton>
        </Stack>
      </Box>
    </Modal>
  );
}

export const useWalletModal = () => {
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => setOpen(false), [setOpen]);
  const openModal = useCallback(() => setOpen(true), [setOpen]);

  const walletModal = <SelectWalletModal isOpen={open} closeModal={closeModal} />;

  return { walletModal, openModal };
};
