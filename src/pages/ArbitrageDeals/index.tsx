import { useMemo } from "react";
import { maxBy, minBy } from "lodash";
import moment from "moment";
import { formatCurrency, useEthPrice } from "../../services/util";
import { useRatesData } from "../../services/hooks";
import { useAppContext } from "../../context/AppContext";
import ArbitrageTable from "./ArbitrageTable";
import { PageWrapper } from "../styled";
import { Deal, OptionType } from "../../types";

const PROFIT_THRESHOLD = 3;

const useDeals = () => {
  const { allRates } = useRatesData();
  const { providers } = useAppContext();

  const deals = useMemo(() => {
    const res: Deal[] = [];

    Object.values(allRates).forEach((strike) =>
      Object.values(strike).forEach((interception) => {
        const providerFiltered = providers
          ? interception.filter((option) => option && providers.includes(option.provider))
          : interception;
        if (providerFiltered?.length < 2) return;

        const maxCall = maxBy(providerFiltered, "options.CALL.bidPrice");
        const minCall = minBy(providerFiltered, "options.CALL.askPrice");
        const maxPut = maxBy(providerFiltered, "options.PUT.bidPrice");
        const minPut = minBy(providerFiltered, "options.PUT.askPrice");
        const callDeal =
          maxCall?.options.CALL?.bidPrice &&
          minCall?.options.CALL?.askPrice &&
          maxCall.provider !== minCall.provider &&
          maxCall.options.CALL.bidPrice - minCall.options.CALL.askPrice;
        const putDeal =
          maxPut?.options.PUT?.bidPrice &&
          minPut?.options.PUT?.askPrice &&
          maxPut.provider !== minPut.provider &&
          maxPut.options.PUT.bidPrice - minPut.options.PUT.askPrice;

        if (callDeal && callDeal > PROFIT_THRESHOLD) {
          res.push({
            type: OptionType.CALL,
            term: maxCall.term,
            strike: maxCall.strike,
            expiration: maxCall.expiration,
            amount: callDeal,
            buy: {
              price: minCall?.options.CALL?.askPrice as number,
              provider: minCall.provider,
            },
            sell: {
              price: maxCall?.options.CALL?.bidPrice as number,
              provider: maxCall.provider,
            },
          });
        }
        if (putDeal && putDeal > PROFIT_THRESHOLD) {
          res.push({
            type: OptionType.PUT,
            term: maxPut.term,
            strike: maxPut.strike,
            expiration: maxPut.expiration,
            amount: putDeal,
            buy: {
              price: minPut?.options.PUT?.askPrice as number,
              provider: minPut.provider,
            },
            sell: {
              price: maxPut?.options.PUT?.bidPrice as number,
              provider: maxPut.provider,
            },
          });
        }
      })
    );

    return res;
  }, [allRates, providers]);

  return [deals];
};

const ArbitrageDeals = () => {
  const { price } = useEthPrice();
  const [deals] = useDeals();

  const tableData = useMemo(() => {
    return deals.map((deal) => {
      const momentExp = moment(deal?.expiration);
      const duration = moment.duration(momentExp.diff(moment())).asYears();

      return {
        ...deal,
        apy: (deal.amount / price / duration) * 100,
        discount: (deal.amount / deal.sell.price) * 100,
      };
    });
  }, [deals]);

  return deals.length > 0 ? (
    <ArbitrageTable data={tableData} />
  ) : (
    <PageWrapper>
      <h4>
        {`Currently there are no deals exceeding ${formatCurrency(PROFIT_THRESHOLD, 2)} delta
          profit threshold`}
        <br />
        <br />
        Come back later
      </h4>
    </PageWrapper>
  );
};

export default ArbitrageDeals;
