/**
 * Triple-factor Group Settlement Algorithm
 * Calculates who owes who with minimum transactions.
 */

export function calculateSettlement(friends, expenses) {
  // 1. Calculate individual total paid and group total
  const totals = {};
  friends.forEach(f => totals[f] = 0);

  let groupTotal = 0;
  expenses.forEach(exp => {
    const amount = parseFloat(exp.amount) || 0;
    totals[exp.paid_by] = (totals[exp.paid_by] || 0) + amount;
    groupTotal += amount;
  });

  const individualShare = groupTotal / (friends.length || 1);

  // 2. Calculate net balances (paid - share)
  const balances = friends.map(name => ({
    name,
    balance: totals[name] - individualShare
  }));

  // 3. Separate Givers and Receivers
  const givers = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const receivers = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

  // 4. Match givers to receivers
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
