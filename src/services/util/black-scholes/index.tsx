import { BuySellModes, DealsFields, Instrument } from "../../../types";
import moment from "moment/moment";
import { getImpliedVolatility } from "../implied-volatility";
import { getDelta, getGamma } from "./greeks";

export const getIV = (
  curPrice: number,
  instrument: Instrument,
  dealMode: BuySellModes
) => {
  const momentExp = moment(instrument.expiration);
  const duration = moment.duration(momentExp.diff(moment())).asYears();
  const instrumentPrice = instrument?.[DealsFields[dealMode]];

  const iv =
    instrumentPrice &&
    getImpliedVolatility(
      instrumentPrice,
      curPrice,
      instrument.strike,
      duration,
      instrument.type
    ) * 100;

  if (!iv) return null;

  return iv > 500 ? ">500" : iv.toFixed();
};

export type Greeks = { delta: number; iv: number; gamma: number };

export const getGreeks = (
  curPrice: number,
  instrument: Instrument,
  dealMode: BuySellModes
) => {
  const momentExp = moment(instrument.expiration);
  const duration = moment.duration(momentExp.diff(moment())).asYears();
  const instrumentPrice = instrument?.[DealsFields[dealMode]] as number;
  const iv = getImpliedVolatility(
    instrumentPrice,
    curPrice,
    instrument.strike,
    duration,
    instrument.type
  );

  const delta = getDelta(
    curPrice,
    instrument.strike,
    duration,
    iv,
    instrument.type
  );
  const gamma = getGamma(curPrice, instrument.strike, duration, iv);

  return { iv, delta, gamma };
};
