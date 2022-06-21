import { useLocation } from "react-router-dom";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import { navigationService } from "../navigation";
import { routes } from "../util/constants";

export interface NavigationOption {
  text: string;
  path: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const useNavigationOptions = (): { navigationOptions: NavigationOption[] } => {
  const location = useLocation();

  const navigationOptions = [
    {
      text: "Deals chart",
      path: routes.dealsChart,
      icon: <StarBorderPurple500Icon />,
      isActive: navigationService.matchRoutePath(location.pathname, routes.dealsChart),
    },
    {
      text: "Aggregated rates",
      path: routes.aggregatedRates,
      icon: <BrokenImageIcon />,
      isActive: navigationService.matchRoutePath(location.pathname, routes.aggregatedRates),
    },
  ];

  return {
    navigationOptions,
  };
};

export default useNavigationOptions;
