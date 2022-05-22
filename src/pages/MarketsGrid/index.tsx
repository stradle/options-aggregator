import styled from "styled-components";
import { chain } from "lodash";
import { Box } from "theme-ui";
import {
  OptionsInterceptions,
  OptionsMap,
  OptionType,
  ProviderType,
} from "../../types";
import { useDeribitContext } from "../../exchanges/deribit";
import { ReactComponent as LyraLogo } from "../../assets/lyra.svg";
import { ReactComponent as DeribitLogo } from "../../assets/deribit.svg";
import { useLyraContext } from "../../exchanges/lyra";
import DealsTable from "./DealsTable";
import { formatCurrency } from "../../util";

/** @jsxImportSource theme-ui */

const StyledTable = styled.table`
  border: solid 1px lightgray;
  border-radius: 5px;
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

const OptionsCouple = ({ optionCouple }: { optionCouple: OptionsMap }) => {
  const { [OptionType.CALL]: call, [OptionType.PUT]: put } =
    optionCouple.options;

  return (
    <StyledOptionCouple>
      {optionCouple.provider === ProviderType.LYRA ? (
        <LyraLogo />
      ) : (
        <DeribitLogo />
      )}
      <div className={"content"}>
        {
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <StyledOptionValue color={"darkgreen"}>
              {call?.midPrice && formatCurrency(call.midPrice)}
            </StyledOptionValue>
            <StyledOptionValue color={"darkred"}>
              {put?.midPrice && formatCurrency(put.midPrice)}
            </StyledOptionValue>
          </div>
        }
      </div>
    </StyledOptionCouple>
  );
};

const MarketsGrid = () => {
  const deribitData = useDeribitContext();
  const lyraData = useLyraContext();

  const deribitTerms = chain(deribitData)
    .uniqBy("term")
    .sortBy("expiration")
    .map("term")
    .value();
  const deribitStrikes = chain(deribitData)
    .map("strike")
    .uniq()
    .filter((val) => +val % 100 === 0)
    .sortBy((strike) => +strike)
    .value();
  const interceptions = lyraData?.reduce<OptionsInterceptions>(
    (acc, lyraItem) => {
      const deribitItem = deribitData?.find(
        ({ term, strike }) =>
          lyraItem.strike === strike && lyraItem.term === term
      );

      if (deribitItem) acc.push([lyraItem, deribitItem]);

      return acc;
    },
    []
  );

  return (
    <Box>
      <div>
        <DealsTable interceptions={interceptions} />
        <h3>Options Markets Grid</h3>
        <StyledTable>
          <thead style={{ fontWeight: 600 }}>
            <tr>
              <td />
              {deribitTerms.map((term) => (
                <td key={term}>{term}</td>
              ))}
            </tr>
          </thead>

          <tbody>
            {deribitStrikes.map((strike) => {
              return (
                <tr key={strike}>
                  <RowHeader key={strike}>{formatCurrency(+strike)}</RowHeader>
                  {deribitTerms.map((term) => {
                    const deribitCouple = deribitData?.find(
                      (optionMap) =>
                        optionMap.term === term &&
                        optionMap.strike === strike &&
                        optionMap.provider === ProviderType.DERIBIT
                    );
                    const lyraCouple = lyraData?.find(
                      (optionMap) =>
                        optionMap.term === term &&
                        optionMap.strike === strike &&
                        optionMap.provider === ProviderType.LYRA
                    );

                    if (!deribitCouple && !lyraCouple) return <td key={term} />;

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
    </Box>
  );
};

export default MarketsGrid;
