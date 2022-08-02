import { OptionType } from "../../types";
import { blackScholes } from "./blacksholes";
/**
 * Calculate a close estimate of implied volatility given an option price.  A
 * binary search type approach is used to determine the implied volatility.
 *
 * @param {Number} expectedCost The market price of the option
 * @param {Number} price Current price of the underlying
 * @param {Number} strike Strike price
 * @param {Number} expiration Time to experiation in years
 * @param {Number} rate Anual risk-free interest rate as a decimal
 * @param {String} callPut The type of option priced - "call" or "put"
 * @param {Number} [estimate=.1] An initial estimate of implied volatility
 * @returns {Number} The implied volatility estimate
 */
export const getImpliedVolatility = (
  expectedCost: number,
  price: number,
  strike: number,
  expiration: number,
  callPut: OptionType,
  estimate = 1,
  rate = 0.05
) => {
  let low = 0;
  let high = Infinity;
  // perform 100 iterations max
  for (let i = 0; i < 1000; i++) {
    const actualCost = blackScholes(
      price,
      strike,
      expiration,
      estimate,
      rate,
      callPut
    );
    // compare the price down to the cent
    if (expectedCost * 100 === Math.floor(actualCost * 100)) {
      break;
    } else if (actualCost > expectedCost) {
      high = estimate;
      estimate = (estimate - low) / 2 + low;
    } else {
      low = estimate;
      estimate = (high - estimate) / 2 + estimate;
      if (!isFinite(estimate)) estimate = low * 2;
    }
  }
  return estimate;
};
