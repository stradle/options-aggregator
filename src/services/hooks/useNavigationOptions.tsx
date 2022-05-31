import { useLocation } from "react-router-dom";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";

import { navigationService } from "../navigation";
import { routes } from "../routes";

export interface NavigationOption {
  text: string;
  path: string;
  icon: React.ReactNode;
  isActive: boolean;
}

export function useNavigationOptions(): { navigationOptions: NavigationOption[] } {
  const location = useLocation();

  const navigationOptions = [
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
    navigationOptions,
  };
}
