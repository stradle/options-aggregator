import { useMemo } from "react";
import { capitalize, maxBy, minBy, sortBy } from "lodash";
import styled from "styled-components";
import { Autocomplete, Box, Chip, TextField } from "@mui/material";
import { useLocalStorage } from "react-use";

import { formatCurrency, useEthPrice } from "../../services/util";
import { useRatesContext } from "../../exchanges/RatesProvider";
import {
  ColoredOptionType,
  StyledTable,
  ProviderIcon,
  Loader,
  BasePriceWidget,
} from "../../components";
import { OptionsMap, OptionType, ProviderType } from "../../types";
import { PageWrapper, StyledProviderLink } from "../styled";
import { useRatesData } from "../../services/hooks";

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
    <StyledProviderLink provider={item.provider}>
      <StyledDealBuySellItem>
        <div>{formatCurrency(item.price)}</div>
        <ProviderIcon provider={item.provider} />
      </StyledDealBuySellItem>
    </StyledProviderLink>
  </td>
);

const useDeals = (providers?: ProviderType[]) => {
  const { allRates } = useRatesData();

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
  const rates = useRatesContext();
  const basePrice = useEthPrice();
  const showLoader = Object.values(rates).some((rates) => !rates);
  const [selectedProviders = Object.values(ProviderType), setSelectedProviders] = useLocalStorage(
    "deals-providers",
    Object.values(ProviderType)
  );
  const [sortedDeals] = useDeals(selectedProviders);

  if (showLoader) {
    return <Loader />;
  }

  // cut too long array
  if (sortedDeals.length > 20) sortedDeals.length = 20;

  return (
    <PageWrapper>
      <BasePriceWidget />
      <Autocomplete
        multiple
        disableClearable
        filterSelectedOptions
        options={Object.values(ProviderType)}
        getOptionLabel={(option) => capitalize(option)}
        renderOption={(props, option) => (
          <Box component="li" sx={{ "& > svg": { mr: 2, flexShrink: 0 } }} {...props}>
            <ProviderIcon marginLeft={5} provider={option} />
            {capitalize(option)}
          </Box>
        )}
        renderInput={(params) => <TextField {...params} label="Markets" />}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              icon={<ProviderIcon marginLeft={5} provider={option} />}
              label={capitalize(option)}
              {...getTagProps({ index })}
              disabled={selectedProviders?.length === 2}
            />
          ))
        }
        onChange={(e, value) => setSelectedProviders(value)}
        value={selectedProviders}
      />
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
          <br />
          <br />
          Come back later
        </h4>
      )}
    </PageWrapper>
  );
};

export default DealsChart;
