import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import { DealsPage } from "../Deals";
import { AggregatedRatesPage } from "../AggregatedRates";
import { routes } from "../../services";
import { Layout, SideMenu } from "../../components";

export const RootRoutes: React.FC = () => {
  return (
    <Router>
      <Layout>
        <SideMenu />

        <Routes>
          <Route path={routes.root} element={<Navigate to={routes.deals} />} />

          <Route path={routes.deals} element={<DealsPage />} />

          <Route path={routes.aggregatedRates} element={<AggregatedRatesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};
