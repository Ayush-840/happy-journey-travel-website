/**
 * Triple-factor Group Settlement Algorithm
 * Calculates who owes who with minimum transactions.
 */

export const currencyRates = {
  "INR": 1,
  "USD": 83.5,
  "EUR": 89.2,
  "GBP": 104.5
};

export const convertToMainCurrency = (amount, fromCurrency, toCurrency = 'INR') => {
  const amountInINR = amount * currencyRates[fromCurrency];
  return amountInINR / currencyRates[toCurrency];
};

export function settleDebts(balances) {
  // balances is an object { id: balance }
  // +ve balance means person gets money back, -ve means person owes money
  
  const givers = [];
  const receivers = [];

  for (const [id, balance] of Object.entries(balances)) {
    if (balance < -0.01) givers.push({ id, balance });
    else if (balance > 0.01) receivers.push({ id, balance });
  }

  givers.sort((a, b) => a.balance - b.balance); // most negative first
  receivers.sort((a, b) => b.balance - a.balance); // most positive first

  const settlements = [];
  let gIdx = 0;
  let rIdx = 0;

  while (gIdx < givers.length && rIdx < receivers.length) {
    const giver = givers[gIdx];
    const receiver = receivers[rIdx];

    const amount = Math.min(Math.abs(giver.balance), receiver.balance);
    if (amount > 0) {
      settlements.push({
        from: giver.id,
        to: receiver.id,
        amount: Math.round(amount)
      });
    }

    giver.balance += amount;
    receiver.balance -= amount;

    if (Math.abs(giver.balance) < 0.01) gIdx++;
    if (Math.abs(receiver.balance) < 0.01) rIdx++;
  }

  return settlements;
}

export function calculateSettlement(friends, expenses) {
  // Existing function if needed elsewhere
  const totals = {};
  friends.forEach(f => totals[f] = 0);

  let groupTotal = 0;
  expenses.forEach(exp => {
    const amount = parseFloat(exp.amount) || 0;
    totals[exp.paid_by] = (totals[exp.paid_by] || 0) + amount;
    groupTotal += amount;
  });

  const individualShare = groupTotal / (friends.length || 1);

  const balances = friends.map(name => ({
    name,
    balance: totals[name] - individualShare
  }));

  const givers = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const receivers = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

  const settlements = [];
  let gIdx = 0;
  let rIdx = 0;

  while (gIdx < givers.length && rIdx < receivers.length) {
    const giver = givers[gIdx];
    const receiver = receivers[rIdx];

    const amount = Math.min(Math.abs(giver.balance), receiver.balance);
    if (amount > 0) {
      settlements.push({
        from: giver.name,
        to: receiver.name,
        amount: Math.round(amount)
      });
    }

    giver.balance += amount;
    receiver.balance -= amount;

    if (Math.abs(giver.balance) < 0.01) gIdx++;
    if (Math.abs(receiver.balance) < 0.01) rIdx++;
  }

  return {
    groupTotal: Math.round(groupTotal),
    individualShare: Math.round(individualShare),
    settlements
  };
}
