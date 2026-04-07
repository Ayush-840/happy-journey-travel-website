/**
 * Minimized Cash Flow Algorithm
 * Calculates the most efficient way to settle debts between a group of people.
 * 
 * @param {Object} balances - Map of userId to net balance (positive means they are owed, negative means they owe)
 * @returns {Array} List of transactions { from, to, amount }
 */
export function settleDebts(balances) {
  const transactions = [];
  
  // Separate debtors and creditors
  const debtors = [];
  const creditors = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance < -0.01) {
      debtors.push({ userId, balance: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ userId, balance });
    }
  }

  // Sort to settle largest amounts first (Greedy approach)
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    
    const settlementAmount = Math.min(debtor.balance, creditor.balance);
    
    if (settlementAmount > 0.01) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Number(settlementAmount.toFixed(2))
      });
    }

    debtor.balance -= settlementAmount;
    creditor.balance -= settlementAmount;

    if (debtor.balance < 0.01) d++;
    if (creditor.balance < 0.01) c++;
  }

  return transactions;
}

/**
 * Mock Currency Converter
 * In a real app, this would fetch from an API.
 */
export const currencyRates = {
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  JPY: 1.81,
  INR: 1.0
};

export function convertToMainCurrency(amount, fromCurrency, toCurrency = 'INR') {
  if (fromCurrency === toCurrency) return amount;
  const rateToINR = 1 / (currencyRates[fromCurrency] || 1);
  const rateToDest = currencyRates[toCurrency] || 1;
  return (amount * rateToINR) * rateToDest;
}
