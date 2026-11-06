export interface MemberBalance {
  memberId: string;
  name: string;
  avatarColor: string;
  avatarEmoji: string;
  totalPaid: number;      // 총 결제한 금액
  totalShare: number;     // 총 분담해야 할 금액
  netBalance: number;     // 순잔액 (totalPaid - totalShare) : 양수면 수령, 음수면 송금
}

export interface TransferTransaction {
  id: string;
  fromMemberId: string;
  fromName: string;
  fromAvatarEmoji: string;
  fromAvatarColor: string;
  toMemberId: string;
  toName: string;
  toAvatarEmoji: string;
  toAvatarColor: string;
  amount: number;
}

export interface ExpenseSplitInput {
  memberId: string;
  amount: number;
}

export interface SettlementResult {
  totalExpense: number;
  averagePerMember: number;
  memberBalances: MemberBalance[];
  transactions: TransferTransaction[];
  categoryTotals: Record<string, number>;
}

/**
 * 10원 단위로 균등 분할 계산 (오차 보정 포함)
 * 총액 totalAmount를 selectedMemberIds 인원수대로 10원 단위 분할하고,
 * 나누어떨어지지 않는 자투리 잔액은 첫 번째 참여자에게 가산하여 총합 보존.
 */
export function calculateEvenSplits(totalAmount: number, memberIds: string[]): ExpenseSplitInput[] {
  if (memberIds.length === 0) return [];
  if (memberIds.length === 1) {
    return [{ memberId: memberIds[0], amount: totalAmount }];
  }

  const count = memberIds.length;
  // 기본 분배 금액 (10원 단위 절사 또는 반올림)
  const baseShare = Math.floor(totalAmount / count / 10) * 10;
  const splits = memberIds.map(memberId => ({
    memberId,
    amount: baseShare,
  }));

  // 분배 합계와 실제 총액의 차이 계산
  const allocatedSum = baseShare * count;
  const remainder = totalAmount - allocatedSum;

  // 나머지 금액은 첫 번째 멤버에게 합산
  if (remainder !== 0) {
    splits[0].amount += remainder;
  }

  return splits;
}

/**
 * 최소 송금 횟수(Minimum Cash Flow) 그리디 알고리즘
 */
export function calculateSettlement(
  members: { id: string; name: string; avatarColor: string; avatarEmoji: string }[],
  expenses: {
    id: string;
    amount: number;
    category: string;
    payerId: string;
    splits: { memberId: string; amount: number }[];
  }[]
): SettlementResult {
  const memberMap = new Map<string, { id: string; name: string; avatarColor: string; avatarEmoji: string }>();
  members.forEach(m => memberMap.set(m.id, m));

  const totalPaidMap = new Map<string, number>();
  const totalShareMap = new Map<string, number>();
  const categoryTotals: Record<string, number> = {};
  let totalExpense = 0;

  members.forEach(m => {
    totalPaidMap.set(m.id, 0);
    totalShareMap.set(m.id, 0);
  });

  expenses.forEach(exp => {
    totalExpense += exp.amount;
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;

    // 결제자
    const currentPaid = totalPaidMap.get(exp.payerId) || 0;
    totalPaidMap.set(exp.payerId, currentPaid + exp.amount);

    // 각 참여자 분담액
    exp.splits.forEach(split => {
      const currentShare = totalShareMap.get(split.memberId) || 0;
      totalShareMap.set(split.memberId, currentShare + split.amount);
    });
  });

  // 각 멤버의 순잔액 계산
  const memberBalances: MemberBalance[] = members.map(m => {
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

  // 그리디 알고리즘을 위한 Debtor(음수)와 Creditor(양수) 분리
  const debtors: { member: MemberBalance; amount: number }[] = [];
  const creditors: { member: MemberBalance; amount: number }[] = [];

  memberBalances.forEach(mb => {
    if (mb.netBalance < 0) {
      debtors.push({ member: mb, amount: -mb.netBalance });
    } else if (mb.netBalance > 0) {
      creditors.push({ member: mb, amount: mb.netBalance });
    }
  });

  // 금액 내림차순 정렬
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: TransferTransaction[] = [];
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
        fromAvatarEmoji: debtor.member.avatarEmoji,
        fromAvatarColor: debtor.member.avatarColor,
        toMemberId: creditor.member.memberId,
        toName: creditor.member.name,
        toAvatarEmoji: creditor.member.avatarEmoji,
        toAvatarColor: creditor.member.avatarColor,
        amount: Math.round(settleAmount),
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;
    }

    if (debtor.amount === 0) {
      dIdx++;
    }
    if (creditor.amount === 0) {
      cIdx++;
    }
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
