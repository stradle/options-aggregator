import { useMemo } from "react";
import { maxBy, minBy, sortBy } from "lodash";
import styled from "styled-components";

import { formatCurrency, useEthPrice } from "../../services/util";
import { useRatesContext } from "../../exchanges/RatesProvider";
import { ColoredOptionType, StyledTable, ProviderIcon, Loader } from "../../components";
import { OptionsInterception, OptionsMap, OptionType, ProviderType } from "../../types";
import { Box } from "@mui/material";

const StyledDealBuySellItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  gap: 3px;
`;

const dealColumns = [
  "Strike",
  "Term",
  "Type",
  "Delta",
  "Buy Price",
  "Sell Price",
  "Delta/Buy",
  "Buy/Base",
];

const PROFIT_THRESHOLD = 3;

type DealPart = { price: number; provider: ProviderType };
type Deal = Pick<OptionsMap, "term" | "strike"> & {
  amount: number;
  type: OptionType;
  buy: DealPart;
  sell: DealPart;
};

const DealBuySellItem = ({ item }: { item: DealPart }) => (
  <td>
    <StyledDealBuySellItem>
      <div>{formatCurrency(item.price)}</div>
      <ProviderIcon provider={item.provider} />
    </StyledDealBuySellItem>
  </td>
);

const DealsChart = () => {
  const rates = useRatesContext();
  const basePrice = useEthPrice();
  const showLoader = Object.values(rates).some((rates) => !rates);

  const interceptions = useMemo(
    () =>
      rates.DERIBIT?.reduce<OptionsInterception[]>((acc, deribitItem) => {
        const lyraItem = rates.LYRA?.find(
          ({ term, strike }) => deribitItem.strike === strike && deribitItem.term === term
        );
        const premiaItem = rates.PREMIA?.find(
          ({ term, strike }) => deribitItem.strike === strike && deribitItem.term === term
        );

        const interception = [deribitItem];

        if (lyraItem) interception.push(lyraItem);
        if (premiaItem) interception.push(premiaItem);

        if (interception.length > 1) acc.push(interception as OptionsInterception);

        return acc;
      }, []),
    [rates]
  );

  const deals = interceptions?.reduce<Deal[]>((acc, interception) => {
    const maxCall = maxBy(interception, "options.CALL.bidPrice");
    const minCall = minBy(interception, "options.CALL.askPrice");
    const maxPut = maxBy(interception, "options.PUT.bidPrice");
    const minPut = minBy(interception, "options.PUT.askPrice");
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
      acc.push({
        type: OptionType.CALL,
        term: maxCall.term,
        amount: callDeal,
        strike: maxCall.strike,
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
      acc.push({
        type: OptionType.PUT,
        term: maxPut.term,
        strike: maxPut.strike,
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

    return acc;
  }, []);

  const sortedDeals = sortBy(deals, ({ amount }) => -amount);

  if (showLoader) {
    return <Loader />;
  }

  // cut too long array
  if (sortedDeals.length > 20) sortedDeals.length = 20;

  return (
    <Box>
      {sortedDeals.length > 0 ? (
        <StyledTable alignRight>
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
            {sortedDeals?.map((deal) => (
              <tr key={deal.strike + deal.term + deal.type}>
                <th>{formatCurrency(+deal.strike)}</th>
                <th>{deal.term}</th>
                <td
                  style={{
                    color: deal.type === OptionType.CALL ? "darkgreen" : "darkred",
                  }}>
                  <ColoredOptionType type={deal.type}>{deal.type}</ColoredOptionType>
                </td>
                <td>{formatCurrency(deal.amount)}</td>
                <DealBuySellItem item={deal.buy} />
                <DealBuySellItem item={deal.sell} />
                <td>%{(deal.amount / deal.buy.price).toFixed(2)}</td>
                <td>%{(deal.buy.price / basePrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      ) : (
        <h4>
          {`Currently there are no deals exceeding ${formatCurrency(PROFIT_THRESHOLD, 2)} delta
          profit threshold`}
        </h4>
      )}
    </Box>
  );
};

export default DealsChart;
