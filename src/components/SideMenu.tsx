import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  ListItemButton,
} from "@mui/material";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import AddchartIcon from "@mui/icons-material/Addchart";

import { routes, navigationService } from "../services";

const drawerWidth = 240;

interface SideMenuOption {
  text: string;
  path: string;
  icon: React.ReactNode;
  isActive: boolean;
}

function useSideMenuOptions(): { sideMenuOptions: SideMenuOption[] } {
  const location = useLocation();

  const sideMenuOptions = [
    {
      text: "Deals",
      path: routes.deals,
      icon: <StarBorderPurple500Icon />,
      isActive: navigationService.matchRoutePath(location.pathname, routes.deals),
    },
    {
      text: "Aggregated Rates",
      path: routes.aggregatedRates,
      icon: <BrokenImageIcon />,
      isActive: navigationService.matchRoutePath(location.pathname, routes.aggregatedRates),
    },
  ];

  return {
    sideMenuOptions,
  };
}

export const SideMenu: React.FC = () => {
  const { sideMenuOptions } = useSideMenuOptions();
  const navigate = useNavigate();

  function handleMenuNavigation(path: string): void {
    navigate(path);
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}>
      <Toolbar>
        <AddchartIcon />
        <h3>Stradle</h3>
      </Toolbar>

      <Divider />

      <Box sx={{ overflow: "auto" }}>
        <List>
          {sideMenuOptions.map(({ text, icon, isActive, path }) => (
            <ListItem key={text} disablePadding onClick={() => handleMenuNavigation(path)}>
              <ListItemButton selected={isActive}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
