// Settlement algorithm test script
const assert = require('assert');

function calculateEvenSplits(totalAmount, memberIds) {
  if (memberIds.length === 0) return [];
  if (memberIds.length === 1) {
    return [{ memberId: memberIds[0], amount: totalAmount }];
  }

  const count = memberIds.length;
  const baseShare = Math.floor(totalAmount / count / 10) * 10;
  const splits = memberIds.map(memberId => ({
    memberId,
    amount: baseShare,
  }));

  const allocatedSum = baseShare * count;
  const remainder = totalAmount - allocatedSum;

  if (remainder !== 0) {
    splits[0].amount += remainder;
  }

  return splits;
}

function calculateSettlement(members, expenses) {
  const memberMap = new Map();
  members.forEach(m => memberMap.set(m.id, m));

  const totalPaidMap = new Map();
  const totalShareMap = new Map();
  const categoryTotals = {};
  let totalExpense = 0;

  members.forEach(m => {
    totalPaidMap.set(m.id, 0);
    totalShareMap.set(m.id, 0);
  });

  expenses.forEach(exp => {
    totalExpense += exp.amount;
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;

    const currentPaid = totalPaidMap.get(exp.payerId) || 0;
    totalPaidMap.set(exp.payerId, currentPaid + exp.amount);

    exp.splits.forEach(split => {
      const currentShare = totalShareMap.get(split.memberId) || 0;
      totalShareMap.set(split.memberId, currentShare + split.amount);
    });
  });

  const memberBalances = members.map(m => {
    const totalPaid = totalPaidMap.get(m.id) || 0;
    const totalShare = totalShareMap.get(m.id) || 0;
    const netBalance = totalPaid - totalShare;
    return {
      memberId: m.id,
      name: m.name,
      avatarColor: m.avatarColor,
      avatarEmoji: m.avatarEmoji,
      totalPaid,
      totalShare,
      netBalance,
    };
  });

  const debtors = [];
  const creditors = [];

  memberBalances.forEach(mb => {
    if (mb.netBalance < 0) {
      debtors.push({ member: mb, amount: -mb.netBalance });
    } else if (mb.netBalance > 0) {
      creditors.push({ member: mb, amount: mb.netBalance });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;
  let txCounter = 1;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0) {
      transactions.push({
        id: `tx-${txCounter++}`,
        fromMemberId: debtor.member.memberId,
        fromName: debtor.member.name,
        toMemberId: creditor.member.memberId,
        toName: creditor.member.name,
        amount: Math.round(settleAmount),
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;
    }

    if (debtor.amount === 0) dIdx++;
    if (creditor.amount === 0) cIdx++;
  }

  const averagePerMember = members.length > 0 ? Math.round(totalExpense / members.length) : 0;

  return {
    totalExpense,
    averagePerMember,
    memberBalances,
    transactions,
    categoryTotals,
  };
}

// ------------------- TEST RUNNER -------------------
console.log('--- Testing Settlement Algorithm ---');

// Test 1: Even Splits sum check
{
  const total = 44000;
  const members = ['m1', 'm2', 'm3', 'm4'];
  const splits = calculateEvenSplits(total, members);
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  assert.strictEqual(sum, total, 'Splits sum must equal total expense');
  console.log('✓ Test 1 Passed: 44,000 KRW evenly divided into 4 people');
}

// Test 2: Odd amount with remainder check
{
  const total = 27000; // 3 people -> 9,000 each
  const members = ['m1', 'm2', 'm3'];
  const splits = calculateEvenSplits(total, members);
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  assert.strictEqual(sum, total);
  console.log('✓ Test 2 Passed: 27,000 KRW divided into 3 people');
}

// Test 3: Un-evenly divisible KRW (e.g., 25,005 -> 10-won units)
{
  const total = 25005;
  const members = ['m1', 'm2', 'm3'];
  const splits = calculateEvenSplits(total, members);
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  assert.strictEqual(sum, total, 'Must preserve exact total even with odd remainder');
  console.log('✓ Test 3 Passed: 25,005 KRW with 10-won rounding and remainder preservation');
}

// Test 4: Realistic 4-member Busan scenario from the prompt
{
  const members = [
    { id: 'm1', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' },
    { id: 'm2', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' },
    { id: 'm3', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' },
    { id: 'm4', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' },
  ];

  const expenses = [
    // 1) 숙소 360,000원 (민수 결제, 4인)
    {
      id: 'e1',
      amount: 360000,
      category: '숙박',
      payerId: 'm1',
      splits: calculateEvenSplits(360000, ['m1', 'm2', 'm3', 'm4']),
    },
    // 2) 밀면 점심 44,000원 (지영 결제, 4인)
    {
      id: 'e2',
      amount: 44000,
      category: '식비',
      payerId: 'm2',
      splits: calculateEvenSplits(44000, ['m1', 'm2', 'm3', 'm4']),
    },
    // 3) 해변열차 티켓 64,000원 (현우 결제, 4인)
    {
      id: 'e3',
      amount: 64000,
      category: '교통',
      payerId: 'm3',
      splits: calculateEvenSplits(64000, ['m1', 'm2', 'm3', 'm4']),
    },
    // 4) 조개구이 저녁 140,000원 (수진 결제, 4인)
    {
      id: 'e4',
      amount: 140000,
      category: '식비',
      payerId: 'm4',
      splits: calculateEvenSplits(140000, ['m1', 'm2', 'm3', 'm4']),
    },
    // 5) 카페 디저트 27,000원 (지영 결제, 지영·수진·현우 3인만)
    {
      id: 'e5',
      amount: 27000,
      category: '식비',
      payerId: 'm2',
      splits: calculateEvenSplits(27000, ['m2', 'm3', 'm4']),
    },
    // 6) 택시비 18,000원 (민수 결제, 4인)
    {
      id: 'e6',
      amount: 18000,
      category: '교통',
      payerId: 'm1',
      splits: calculateEvenSplits(18000, ['m1', 'm2', 'm3', 'm4']),
    },
  ];

  const result = calculateSettlement(members, expenses);
  console.log(`Total Expense: ${result.totalExpense.toLocaleString()} KRW`);
  console.log(`Average per person: ${result.averagePerMember.toLocaleString()} KRW`);
  console.log('Member Balances:');
  result.memberBalances.forEach(mb => {
    console.log(` - ${mb.name}: Paid=${mb.totalPaid.toLocaleString()}, Share=${mb.totalShare.toLocaleString()}, Net=${mb.netBalance.toLocaleString()}`);
  });
  console.log('Transactions (Minimum Cash Flow):');
  result.transactions.forEach(tx => {
    console.log(` -> ${tx.fromName} sends ${tx.amount.toLocaleString()} KRW to ${tx.toName}`);
  });

  // Verification: total net balance sum must be 0
  const netSum = result.memberBalances.reduce((acc, mb) => acc + mb.netBalance, 0);
  assert.strictEqual(netSum, 0, 'Sum of all net balances must be zero');

  // Total transferred amount must balance all debts
  const totalSent = result.transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const totalPositiveNet = result.memberBalances.filter(m => m.netBalance > 0).reduce((acc, m) => acc + m.netBalance, 0);
  assert.strictEqual(totalSent, totalPositiveNet, 'Total sent must exactly match total positive net balances');
  console.log('✓ Test 4 Passed: Realistic Busan 4-person settlement successfully balanced');
}

console.log('All Settlement Tests Passed successfully! 🎉');
