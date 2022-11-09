import { useMemo } from "react";
import { maxBy, minBy } from "lodash";
import moment from "moment";
import { formatCurrency, useTokenPrice } from "../../services/util";
import { useRatesData } from "../../services/hooks";
import { useAppContext } from "../../context/AppContext";
import ArbitrageTable from "./ArbitrageTable";
import { PageWrapper } from "../styled";
import { Deal, OptionType } from "../../types";
import ProviderSelector from "../../components/ProviderSelector";

const PROFIT_THRESHOLD = 3;

const useDeals = () => {
  const { allRates } = useRatesData();
  const { providers } = useAppContext();

  const deals = useMemo(() => {
    const res: Deal[] = [];

    Object.values(allRates).forEach((strike) =>
      Object.values(strike).forEach((interception) => {
        const providerFiltered = providers
          ? interception.filter(
              (option) => option && providers.includes(option.provider)
            )
          : interception;
        if (providerFiltered?.length < 2) return;

        const maxCall = maxBy(providerFiltered, "CALL.bidPrice")?.CALL;
        const minCall = minBy(providerFiltered, "CALL.askPrice")?.CALL;
        const maxPut = maxBy(providerFiltered, "PUT.bidPrice")?.PUT;
        const minPut = minBy(providerFiltered, "PUT.askPrice")?.PUT;
        const callDeal =
          maxCall?.bidPrice &&
          minCall?.askPrice &&
          maxCall.provider !== minCall.provider &&
          maxCall.bidPrice - minCall.askPrice;
        const putDeal =
          maxPut?.bidPrice &&
          minPut?.askPrice &&
          maxPut.provider !== minPut.provider &&
          maxPut.bidPrice - minPut.askPrice;

        if (callDeal && callDeal > PROFIT_THRESHOLD) {
          res.push({
            type: OptionType.CALL,
            term: maxCall.term,
            strike: maxCall.strike,
            expiration: maxCall.expiration,
            amount: callDeal,
            buy: minCall,
            sell: maxCall,
          });
        }
        if (putDeal && putDeal > PROFIT_THRESHOLD) {
          res.push({
            type: OptionType.PUT,
            term: maxPut.term,
            strike: maxPut.strike,
            expiration: maxPut.expiration,
            amount: putDeal,
            buy: minPut,
            sell: maxPut,
          });
        }
      })
    );

    return res;
  }, [allRates, providers]);

  return [deals];
};

const ArbitrageDeals = () => {
  const { underlying } = useAppContext();
  const { price } = useTokenPrice(underlying);
  const [deals] = useDeals();

  const tableData = useMemo(() => {
    return deals.map((deal) => {
      const momentExp = moment(deal?.expiration);
      const duration = moment.duration(momentExp.diff(moment())).asYears();

      return {
        ...deal,
        apy: (deal.amount / price / duration) * 100,
        discount: (deal.amount / (deal.sell?.bidPrice as number)) * 100,
      };
    });
  }, [deals]);

  return (
    <PageWrapper >
      <div style={{ display: "flex", justifyContent: "end", width: "100%" }}>
        <ProviderSelector />
      </div>
      {deals.length > 0 ? (
        <ArbitrageTable data={tableData} />
      ) : (
        <h4>
          {`Currently there are no deals exceeding ${formatCurrency(
            PROFIT_THRESHOLD,
            2
          )} delta profit threshold`}
          <br />
          <br />
          Come back later
        </h4>
      )}
    </PageWrapper>
  );
};

export default ArbitrageDeals;
