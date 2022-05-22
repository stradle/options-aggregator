export const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }).format(
    val
  );
// new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(val);
