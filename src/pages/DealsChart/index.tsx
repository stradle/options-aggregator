import { useMemo } from "react";
import { maxBy, minBy, sortBy } from "lodash";
import styled from "styled-components";
import { formatCurrency, useEthPrice } from "../../services/util";
import { useRatesData } from "../../services/hooks";
import { useAppContext } from "../../context/AppContext";
import { ColoredOptionType, StyledTable, ProviderIcon } from "../../components";
import { PageWrapper, StyledProviderLink } from "../styled";
import { OptionsMap, OptionType, ProviderType } from "../../types";

const StyledDealBuySellItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  gap: 3px;
  color: white;
  font-size: 16px;
`;

const dealColumns = [
  "Strike",
  "Term",
  "Type",
  "Delta",
  "Buy Price",
  "Sell Price",
  "Discount",
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
    <StyledProviderLink provider={item.provider}>
      <StyledDealBuySellItem>
        <div>{formatCurrency(item.price)}</div>
        <ProviderIcon provider={item.provider} />
      </StyledDealBuySellItem>
    </StyledProviderLink>
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
          res.push({
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
      })
    );

    return sortBy(res, ({ amount }) => -amount);
  }, [allRates, providers]);

  return [deals];
};

const DealsChart = () => {
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
            {sortedDeals?.map((deal) => (
              <tr key={deal.strike + deal.term + deal.type}>
                <th>{formatCurrency(+deal.strike)}</th>
                <th>{deal.term}</th>
                <td>
                  <ColoredOptionType style={{ fontWeight: 500 }} type={deal.type}>
                    {deal.type}
                  </ColoredOptionType>
                </td>
                <td>{formatCurrency(deal.amount)}</td>
                <DealBuySellItem item={deal.buy} />
                <DealBuySellItem item={deal.sell} />
                <td>{((deal.amount / deal.sell.price) * 100).toFixed(2)}%</td>
                <td>{((deal.buy.price / price) * 100).toFixed(2)}%</td>
              </tr>
            ))}
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

export default DealsChart;
