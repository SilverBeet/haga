export const formatPrice = (price: number) =>
    Intl.NumberFormat("default", { style: "currency", currency: "nok", currencyDisplay: 'code' }).format(price)