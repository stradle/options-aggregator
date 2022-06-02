import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import DealsChart from "./DealsChart";
import AggregatedRates from "./AggregatedRates";
import { Layout, NavigationPanel } from "../components";
import { routes } from "../services/util/constants";

const AppRouter = () => {
  return (
    <Router>
      <NavigationPanel />

      <Layout>
        <Routes>
          <Route path={routes.root} element={<Navigate to={routes.aggregatedRates} />} />

          <Route path={routes.dealsChart} element={<DealsChart />} />

          <Route path={routes.aggregatedRates} element={<AggregatedRates />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter;
