import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { routes } from "../services/util/constants";
import DealsChart from "./DealsChart";
import AggregatedRates from "./AggregatedRates";
import NavigationPanel from "../components/NavigationPanel";
import Layout from "./Layout";

const AppRouter = () => {
  return (
    <Router>
      <NavigationPanel />

      <Routes>
        <Route element={<Layout />}>
          <Route path={routes.root} element={<Navigate to={routes.aggregatedRates} />} />

          <Route path={routes.dealsChart} element={<DealsChart />} />

          <Route path={routes.aggregatedRates} element={<AggregatedRates />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
