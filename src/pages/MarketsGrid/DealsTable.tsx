import { maxBy, minBy, sortBy } from "lodash";
import styled from "styled-components";
import { ReactComponent as DeribitLogo } from "../../assets/deribit.svg";
import { ReactComponent as LyraLogo } from "../../assets/lyra.svg";
import { formatCurrency } from "../../util";
import {
  OptionsInterceptions,
  OptionsMap,
  OptionType,
  ProviderType,
} from "../../types";

const StyledDealBuySellItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const dealColumns = [
  "Strike",
  "Term",
  "Type",
  "Delta",
  "Buy Price",
  "Sell Price",
];

const MIN_DIF = 7;
type DealPart = { price: number; provider: ProviderType };
type Deal = Pick<OptionsMap, "term" | "strike"> & {
  amount: number;
  type: OptionType;
  buy: DealPart;
  sell: DealPart;
};

const ProviderIcons = {
  [ProviderType.DERIBIT]: <DeribitLogo height="15px" width="15px" />,
  [ProviderType.LYRA]: <LyraLogo height="15px" width="15px" />,
};

const DealBuySellItem = ({ item }: { item: DealPart }) => {
  return (
    <td>
      <StyledDealBuySellItem>
        {formatCurrency(item.price)}
        {ProviderIcons[item.provider]}
      </StyledDealBuySellItem>
    </td>
  );
};

const StyledTable = styled.table`
  border: solid 1px lightgray;
  border-radius: 5px;
`;

const DealsTable = ({
  interceptions,
}: {
  interceptions?: OptionsInterceptions;
}) => {
  const deals = interceptions?.reduce<Deal[]>((acc, options) => {
    const maxCall = maxBy(options, "options.CALL.midPrice");
    const minCall = minBy(options, "options.CALL.midPrice");
    const maxPut = maxBy(options, "options.PUT.midPrice");
    const minPut = minBy(options, "options.PUT.midPrice");
    const callDeal =
      maxCall?.options.CALL?.askPrice &&
      minCall?.options.CALL?.bidPrice &&
      maxCall.provider !== minCall.provider &&
      maxCall.options.CALL.midPrice - minCall.options.CALL.midPrice;
    const putDeal =
      maxPut?.options.PUT?.askPrice &&
      minPut?.options.PUT?.bidPrice &&
      maxPut.provider !== minPut.provider &&
      maxPut.options.PUT.midPrice - minPut.options.PUT.midPrice;

    if (callDeal && callDeal > MIN_DIF) {
      acc.push({
        type: OptionType.CALL,
        term: maxCall.term,
        amount: callDeal,
        strike: maxCall.strike,
        buy: {
          price: minCall?.options.CALL?.midPrice as number,
          provider: minCall.provider,
        },
        sell: {
          price: maxCall?.options.CALL?.midPrice as number,
          provider: maxCall.provider,
        },
      });
    }
    if (putDeal && putDeal > MIN_DIF) {
      acc.push({
        type: OptionType.PUT,
        term: maxPut.term,
        strike: maxPut.strike,
        amount: putDeal,
        buy: {
          price: minPut?.options.PUT?.midPrice as number,
          provider: minPut.provider,
        },
        sell: {
          price: maxPut?.options.PUT?.midPrice as number,
          provider: maxPut.provider,
        },
      });
    }

    return acc;
  }, []);
  const sortedDeals = sortBy(deals, ({ amount }) => -amount);

  return (
    <div>
      <h3>Deals chart</h3>
      <StyledTable>
        <thead>
          <tr>
            {dealColumns.map((val) => (
              <td style={{ fontWeight: 600 }} key={val}>
                {val}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDeals?.map((deal) => (
            <tr key={deal.strike + deal.term + deal.type}>
              <td style={{ fontWeight: 600 }}>
                {formatCurrency(+deal.strike)}
              </td>
              <td style={{ fontWeight: 600 }}>{deal.term}</td>
              <td>{deal.type}</td>
              <td>{formatCurrency(deal.amount)}</td>
              <DealBuySellItem item={deal.buy} />
              <DealBuySellItem item={deal.sell} />
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default DealsTable;
