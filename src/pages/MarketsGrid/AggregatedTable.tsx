import { chain } from "lodash";
import styled from "styled-components";
import { formatCurrency, useExpirations, useStrikes } from "../../util";
import { useRateContext } from "../../exchanges/RateProvider";
import { OptionsMap, OptionType, ProviderType } from "../../types";
import { ReactComponent as LyraLogo } from "../../assets/lyra.svg";
import { ReactComponent as DeribitLogo } from "../../assets/deribit.svg";
import { ReactComponent as PremiaLogo } from "../../assets/premia.svg";

const StyledTable = styled.table`
  border-radius: 5px;
  border-collapse: collapse;

  &,
  th,
  td {
    border: 1px gray solid;
  }
`;
const RowHeader = styled.td`
  font-weight: 600;
`;

const StyledOptionCouple = styled.div`
  overflow: hidden;
  position: relative;

  svg {
    opacity: 0.4;
    position: absolute;
    left: 25%;
    top: 25%;
    width: 2rem;
    height: auto;
    aspect-ratio: 1 / 1;
  }

  .content {
    position: relative;
  }
`;

const StyledOptionValue = styled.div<{ color?: string }>`
  height: 20px;
  min-width: 40px;
  color: ${({ color }) => color};
`;

const providerLogos = {
  [ProviderType.LYRA]: LyraLogo,
  [ProviderType.DERIBIT]: DeribitLogo,
  [ProviderType.PREMIA]: PremiaLogo,
};

const OptionsCouple = ({ optionCouple }: { optionCouple: OptionsMap }) => {
  const { [OptionType.CALL]: call, [OptionType.PUT]: put } =
    optionCouple.options;

  const callPrice = call?.midPrice ?? call?.bidPrice;
  const putPrice = put?.midPrice ?? put?.bidPrice;
  const LogoComponent = providerLogos[optionCouple.provider];

  return (
    <StyledOptionCouple>
      {<LogoComponent />}
      <div className={"content"}>
        {
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <StyledOptionValue color={"darkgreen"}>
              {callPrice && formatCurrency(callPrice)}
            </StyledOptionValue>
            <StyledOptionValue color={"darkred"}>
              {putPrice && formatCurrency(putPrice)}
            </StyledOptionValue>
          </div>
        }
      </div>
    </StyledOptionCouple>
  );
};

const AggregatedTable = () => {
  const rates = useRateContext();
  const { allStrikes = [], basePrice } = useStrikes();

  const [expirations] = useExpirations(rates.DERIBIT);

  const deribitStrikes = chain(rates.DERIBIT)
    .map("strike")
    .uniq()
    .filter((val) => allStrikes.includes(+val))
    .sortBy((strike) => +strike)
    .value();

  return (
    <div>
      <h3>Options Markets Grid</h3>
      <StyledTable>
        <thead style={{ fontWeight: 600 }}>
          <tr>
            <td />
            {expirations.map(([term]) => (
              <td key={term}>{term}</td>
            ))}
          </tr>
        </thead>

        <tbody>
          {deribitStrikes.map((strike) => {
            return (
              <tr key={strike}>
                <RowHeader key={strike}>{formatCurrency(+strike)}</RowHeader>
                {expirations.map(([term]) => {
                  const deribitCouple = rates.DERIBIT?.find(
                    (optionMap) =>
                      optionMap.term === term &&
                      optionMap.strike === strike &&
                      optionMap.provider === ProviderType.DERIBIT
                  );
                  const lyraCouple = rates.LYRA?.find(
                    (optionMap) =>
                      optionMap.term === term &&
                      optionMap.strike === strike &&
                      optionMap.provider === ProviderType.LYRA
                  );
                  const premiaCouple = rates.PREMIA?.find(
                    (optionMap) =>
                      optionMap.term === term &&
                      optionMap.strike === strike &&
                      optionMap.provider === ProviderType.PREMIA
                  );

                  if (!deribitCouple && !lyraCouple && !premiaCouple)
                    return <td key={term} />;

                  return (
                    <td key={term}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        {deribitCouple ? (
                          <OptionsCouple optionCouple={deribitCouple} />
                        ) : (
                          <div />
                        )}
                        {lyraCouple ? (
                          <OptionsCouple optionCouple={lyraCouple} />
                        ) : (
                          <div />
                        )}
                        {premiaCouple ? (
                          <OptionsCouple optionCouple={premiaCouple} />
                        ) : (
                          <div />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default AggregatedTable;
