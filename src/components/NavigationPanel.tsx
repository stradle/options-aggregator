import React, { useState } from "react";
import { matchPath, useLocation, useNavigate, Link } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddchartIcon from "@mui/icons-material/Addchart";
import useNavigationOptions from "../services/hooks/useNavigationOptions";
import { routes } from "../services/util/constants";
import ColorModeSwitcher from "./ColorModeSwitcher";

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

function useRouteMatch(patterns: readonly string[]) {
  const { pathname } = useLocation();

  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i];
    const possibleMatch = matchPath(pattern, pathname);
    if (possibleMatch !== null) {
      return possibleMatch;
    }
  }

  return null;
}

const DesktopNavigation: React.FC = () => {
  const { navigationOptions } = useNavigationOptions();
  const routeMatch = useRouteMatch(navigationOptions.map(({ path }) => path));
  const currentTab = routeMatch?.pattern?.path;

  return (
    <Box
      sx={{
        width: "100%",
        display: {
          xs: "none",
          md: "flex",
          justifyContent: "space-between",
        },
      }}>
      <Tabs value={currentTab} textColor="inherit" aria-label="nav tabs example">
        {navigationOptions.map((option) => (
          <Tab
            key={option.path}
            label={option.text}
            value={option.path}
            to={option.path}
            component={Link}
            sx={{ textTransform: "none", fontSize: "1rem" }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

const NavigationPanel: React.FC = () => {
  const navigate = useNavigate();

  function navigateRoot(): void {
    navigate(routes.root);
  }

  return (
    <AppBar position="static" color="inherit">
      <Container
        maxWidth="xl"
        sx={{
          maxHeight: "50px",
          display: "flex",
          alignItems: "center",
        }}>
        <Toolbar disableGutters sx={{ padding: { xs: 0, md: "0 200px" }, width: "100%" }}>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}>
            <AddchartIcon
              sx={{ color: "primary.main", cursor: "pointer" }}
              onClick={() => navigateRoot()}
            />
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
                minWidth: "100px",
              }}>
              Stradle
            </Typography>
            <DesktopNavigation />
          </div>
          <ColorModeSwitcher />

          <MobileNavigation />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavigationPanel;
