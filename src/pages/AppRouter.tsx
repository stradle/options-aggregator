import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { routes } from "../services/util/constants";
import ArbitrageDeals from "./ArbitrageDeals";
import AggregatedRates from "./AggregatedRates";
import Portfolio from "./Portfolio";
import NavigationPanel from "../components/NavigationPanel";
import Layout from "./Layout";

const AppRouter = () => {
  return (
    <Router>
      <NavigationPanel />

      <Routes>
        <Route element={<Layout />}>
          <Route path={routes.root} element={<Navigate to={routes.arbitrageDeals} />} />

          <Route path={routes.arbitrageDeals} element={<ArbitrageDeals />} />

          <Route path={routes.aggregatedRates} element={<AggregatedRates />} />

          <Route path={routes.portfolio} element={<Portfolio />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
