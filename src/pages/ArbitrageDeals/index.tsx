import { useMemo } from "react";
import { maxBy, minBy, sortBy } from "lodash";
import { styled } from "@mui/material";
import moment from "moment";
import { formatCurrency, useEthPrice } from "../../services/util";
import { useRatesData } from "../../services/hooks";
import { useAppContext } from "../../context/AppContext";
import { ColoredOptionType, StyledTable, ProviderIcon } from "../../components";
import { PageWrapper } from "../styled";
import { OptionsMap, OptionType, ProviderType } from "../../types";

const StyledDealBuySellItem = styled("div")({
  fontSize: "inherit",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "end",
  gap: "3px",
});

const dealColumns = ["Strike", "Term", "Type", "Delta", "Buy", "Sell", "Discount", "APY"];

const PROFIT_THRESHOLD = 3;

type DealPart = { price: number; provider: ProviderType };
type Deal = Pick<OptionsMap, "term" | "strike"> & {
  amount: number;
  expiration: number;
  type: OptionType;
  buy: DealPart;
  sell: DealPart;
};

const DealBuySellItem = ({ item }: { item: DealPart }) => (
  <td>
    <StyledDealBuySellItem>
      <div>{formatCurrency(item.price, 2)}</div>
      <ProviderIcon provider={item.provider} />
    </StyledDealBuySellItem>
  </td>
);

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

    return sortBy(res, ({ amount }) => -amount);
  }, [allRates, providers]);

  return [deals];
};

const ArbitrageDeals = () => {
  const { price } = useEthPrice();
  const [sortedDeals] = useDeals();

  // cut too long array
  if (sortedDeals.length > 20) sortedDeals.length = 20;

  return (
    <PageWrapper>
      {sortedDeals.length > 0 ? (
        <StyledTable>
          <thead>
            <tr>
              {dealColumns.map((val) => (
                <th style={{ fontWeight: 600 }} key={val}>
                  {val}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedDeals?.map((deal) => {
              const momentExp = moment(deal?.expiration);
              const duration = moment.duration(momentExp.diff(moment())).asYears();

              return (
                <tr key={deal.strike + deal.term + deal.type}>
                  <th>{formatCurrency(+deal.strike)}</th>
                  <th>{deal.term}</th>
                  <td>
                    <ColoredOptionType type={deal.type}>{deal.type}</ColoredOptionType>
                  </td>
                  <td>{formatCurrency(deal.amount, 2)}</td>
                  <DealBuySellItem item={deal.buy} />
                  <DealBuySellItem item={deal.sell} />
                  <td>{((deal.amount / deal.sell.price) * 100).toFixed(2)}%</td>
                  <td>{((deal.amount / price / duration) * 100).toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </StyledTable>
      ) : (
        <h4>
          {`Currently there are no deals exceeding ${formatCurrency(PROFIT_THRESHOLD, 2)} delta
          profit threshold`}
          <br />
          <br />
          Come back later
        </h4>
      )}
    </PageWrapper>
  );
};

export default ArbitrageDeals;
