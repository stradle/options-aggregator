import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddchartIcon from "@mui/icons-material/Addchart";

import { routes, useNavigationOptions } from "../services";

const MobileNavigation: React.FC = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const { navigationOptions } = useNavigationOptions();
  const navigate = useNavigate();

  function handleMenuNavigation(path: string): void {
    navigate(path);

    handleCloseNavMenu();
  }

  function handleOpenNavMenu(event: React.MouseEvent<HTMLElement>): void {
    setAnchorElNav(event.currentTarget);
  }

  function handleCloseNavMenu(): void {
    setAnchorElNav(null);
  }

  return (
    <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleOpenNavMenu}
        color="inherit">
        <MenuIcon />
      </IconButton>

      <Menu
        id="menu-appbar"
        anchorEl={anchorElNav}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
        sx={{
          display: { xs: "block", md: "none" },
        }}>
        {navigationOptions.map(({ text, path, isActive }) => (
          <MenuItem selected={isActive} key={text} onClick={() => handleMenuNavigation(path)}>
            <Typography textAlign="center">{text}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const DesktopNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { navigationOptions } = useNavigationOptions();

  function handleMenuNavigation(path: string): void {
    navigate(path);
  }

  return (
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
      {navigationOptions.map(({ text, path }) => (
        <Button
          key={text}
          onClick={() => handleMenuNavigation(path)}
          sx={{ my: 2, color: "white", display: "block" }}>
          {text}
        </Button>
      ))}
    </Box>
  );
};

export const NavigationPanel: React.FC = () => {
  const navigate = useNavigate();

  function navigateRoot(): void {
    navigate(routes.root);
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: "#293846" }}>
      <Container
        maxWidth="xl"
        sx={{
          maxHeight: "50px",
          display: "flex",
          alignItems: "center",
        }}>
        <Toolbar disableGutters>
          <AddchartIcon onClick={() => navigateRoot()} sx={{ cursor: "pointer" }} />

          <Typography
            variant="h6"
            noWrap
            component="a"
            href={routes.root}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
              paddingLeft: ".3rem",
            }}>
            Stradle
          </Typography>

          <DesktopNavigation />

          <MobileNavigation />
        </Toolbar>
      </Container>
    </AppBar>
  );
};
