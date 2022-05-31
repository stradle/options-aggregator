import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import { DealsPage } from "../Deals";
import { AggregatedRatesPage } from "../AggregatedRates";
import { routes } from "../../services";
import { Layout, NavigationPanel, BasePriceWidget } from "../../components";

export const RootRoutes: React.FC = () => {
  return (
    <Router>
      <NavigationPanel />

      <Layout>
        <BasePriceWidget />

        <Routes>
          <Route path={routes.root} element={<Navigate to={routes.deals} />} />

          <Route path={routes.deals} element={<DealsPage />} />

          <Route path={routes.aggregatedRates} element={<AggregatedRatesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};
