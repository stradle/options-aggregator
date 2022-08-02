import { useLocation } from "react-router-dom";
import { navigationService } from "../navigation";
import { routes } from "../util/constants";

export interface NavigationOption {
  text: string;
  path: string;
  isActive: boolean;
}

const useNavigationOptions = (): { navigationOptions: NavigationOption[] } => {
  const location = useLocation();

  const navigationOptions = [
    {
      text: "Arbitrage deals",
      path: routes.arbitrageDeals,
      isActive: navigationService.matchRoutePath(location.pathname, routes.arbitrageDeals),
    },
    {
      text: "Aggregated rates",
      path: routes.aggregatedRates,
      isActive: navigationService.matchRoutePath(location.pathname, routes.aggregatedRates),
    },
    {
      text: "Portfolio",
      path: routes.portfolio,
      isActive: navigationService.matchRoutePath(location.pathname, routes.portfolio),
    },
  ];

  return {
    navigationOptions,
  };
};

export default useNavigationOptions;
