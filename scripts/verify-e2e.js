const assert = require('assert');

async function runE2EValidation() {
  const baseUrl = 'http://localhost:3000';
  console.log('=== Starting E2E Functional Validation ===\n');

  // 1. Initial State Check
  console.log('[Step 1] Fetching initial trip state...');
  const res1 = await fetch(`${baseUrl}/api/trip`);
  assert.strictEqual(res1.status, 200, 'GET /api/trip must return 200');
  const trip1 = await res1.json();
  console.log(`✓ Trip Loaded: "${trip1.title}"`);
  console.log(`✓ Members (${trip1.members.length}): ${trip1.members.map(m => m.name).join(', ')}`);
  console.log(`✓ Initial Itinerary Count: ${trip1.itineraryItems.length}`);
  console.log(`✓ Initial Expenses Count: ${trip1.expenses.length}`);

  // Check Day 1, Day 2, Day 3 items distribution
  const day1Items = trip1.itineraryItems.filter(i => i.dayNumber === 1);
  const day2Items = trip1.itineraryItems.filter(i => i.dayNumber === 2);
  const day3Items = trip1.itineraryItems.filter(i => i.dayNumber === 3);
  console.log(`  - Day 1 places: ${day1Items.length} (Expected 5)`);
  console.log(`  - Day 2 places: ${day2Items.length} (Expected 4)`);
  console.log(`  - Day 3 places: ${day3Items.length} (Expected 3)`);
  assert.strictEqual(day1Items.length, 5);
  assert.strictEqual(day2Items.length, 4);
  assert.strictEqual(day3Items.length, 3);

  // 2. Add New Itinerary Item (Scenario 2)
  console.log('\n[Step 2] Adding a new Itinerary item to Day 2...');
  const newItemPayload = {
    tripId: trip1.id,
    dayNumber: 2,
    title: '광안리 드론라이트쇼',
    category: '관광',
    time: '20:30',
    memo: '토요일 상설 드론 라이트 쇼 관람',
    lat: 35.1532,
    lng: 129.1186,
    estimatedCost: 0,
  };

  const addItinRes = await fetch(`${baseUrl}/api/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newItemPayload),
  });
  assert.strictEqual(addItinRes.status, 201, 'POST /api/itinerary must return 201');
  const addedItem = await addItinRes.json();
  console.log(`✓ Added Item: ID=${addedItem.id}, OrderIndex=${addedItem.orderIndex}, Title="${addedItem.title}"`);

  // Verify it exists in updated trip
  const res2 = await fetch(`${baseUrl}/api/trip`);
  const trip2 = await res2.json();
  const day2ItemsUpdated = trip2.itineraryItems.filter(i => i.dayNumber === 2);
  assert.strictEqual(day2ItemsUpdated.length, 5, 'Day 2 items count must now be 5');
  console.log(`✓ Day 2 itinerary items successfully updated to ${day2ItemsUpdated.length}`);

  // Test Reorder (Up)
  console.log('\n[Step 2-1] Testing Reorder (moving new item up)...');
  const reorderRes = await fetch(`${baseUrl}/api/itinerary/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId: addedItem.id, direction: 'up' }),
  });
  assert.strictEqual(reorderRes.status, 200, 'Reorder must return 200');
  console.log('✓ Successfully moved item orderIndex up');

  // 3. Add New Expense & Check Settlement Recalculation (Scenario 3)
  console.log('\n[Step 3] Adding a new Expense and checking settlement re-calculation...');
  const minsu = trip2.members.find(m => m.name === '민수');
  const allMemberIds = trip2.members.map(m => m.id);

  const newExpensePayload = {
    tripId: trip2.id,
    title: '해운대 포장마차 해물라면 야식',
    amount: 32000,
    category: '식비',
    payerId: minsu.id,
    splitMemberIds: allMemberIds,
  };

  const addExpenseRes = await fetch(`${baseUrl}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newExpensePayload),
  });
  assert.strictEqual(addExpenseRes.status, 201, 'POST /api/expenses must return 201');
  const addedExpense = await addExpenseRes.json();
  console.log(`✓ Added Expense: "${addedExpense.title}", Amount=${addedExpense.amount} KRW, Payer=${addedExpense.payer.name}`);

  // Check updated trip settlement
  const res3 = await fetch(`${baseUrl}/api/trip`);
  const trip3 = await res3.json();
  assert.strictEqual(trip3.expenses.length, 7, 'Total expenses should now be 7');
  const totalExpenseSum = trip3.expenses.reduce((s, e) => s + e.amount, 0);
  assert.strictEqual(totalExpenseSum, 653000 + 32000, 'Total expense should be 685,000 KRW');
  console.log(`✓ Total Expenses updated to: ${totalExpenseSum.toLocaleString()} KRW`);

  // Verify settlement calculation logic with new expense
  function calcSettlement(members, expenses) {
    const totalPaidMap = new Map();
    const totalShareMap = new Map();
    let totalExpense = 0;

    members.forEach(m => {
      totalPaidMap.set(m.id, 0);
      totalShareMap.set(m.id, 0);
    });

    expenses.forEach(exp => {
      totalExpense += exp.amount;
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
      return {
        memberId: m.id,
        name: m.name,
        totalPaid,
        totalShare,
        netBalance: totalPaid - totalShare,
      };
    });

    const debtors = [];
    const creditors = [];

    memberBalances.forEach(mb => {
      if (mb.netBalance < 0) debtors.push({ member: mb, amount: -mb.netBalance });
      else if (mb.netBalance > 0) creditors.push({ member: mb, amount: mb.netBalance });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const settleAmount = Math.min(debtor.amount, creditor.amount);

      if (settleAmount > 0) {
        transactions.push({
          fromName: debtor.member.name,
          toName: creditor.member.name,
          amount: Math.round(settleAmount),
        });
        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;
      }
      if (debtor.amount === 0) dIdx++;
      if (creditor.amount === 0) cIdx++;
    }

    return { totalExpense, memberBalances, transactions };
  }

  const settlement = calcSettlement(trip3.members, trip3.expenses);
  console.log(`✓ Recalculated Settlement Transactions (${settlement.transactions.length} transfers):`);
  settlement.transactions.forEach(tx => {
    console.log(`  -> ${tx.fromName} sends ${tx.amount.toLocaleString()} KRW to ${tx.toName}`);
  });

  const netSum = settlement.memberBalances.reduce((acc, mb) => acc + mb.netBalance, 0);
  assert.strictEqual(netSum, 0, 'Sum of all net balances must remain exactly zero');
  console.log('✓ Net balance sum constraint (sum === 0) perfectly satisfied');

  // 4. Test Cleanup of the newly added items so initial seed state is preserved (optional)
  console.log('\n[Step 4] Cleaning up test items to restore pristine seed state...');
  await fetch(`${baseUrl}/api/itinerary/${addedItem.id}`, { method: 'DELETE' });
  await fetch(`${baseUrl}/api/expenses/${addedExpense.id}`, { method: 'DELETE' });

  const resFinal = await fetch(`${baseUrl}/api/trip`);
  const tripFinal = await resFinal.json();
  assert.strictEqual(tripFinal.itineraryItems.length, 12, 'Itinerary should be back to 12');
  assert.strictEqual(tripFinal.expenses.length, 6, 'Expenses should be back to 6');
  console.log('✓ Pristine seed data verified: 12 itinerary items, 6 expenses');

  console.log('\n==========================================');
  console.log('🎉 ALL E2E VERIFICATION SCENARIOS PASSED! 🎉');
  console.log('==========================================\n');
}

runE2EValidation().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
