import type { IncomeStat } from '../../types'

const MOCK_INCOME: IncomeStat[] = [
    { month: '2025-07', total: 18000 },
    { month: '2025-08', total: 20500 },
    { month: '2025-09', total: 19500 },
    { month: '2025-10', total: 22500 },
    { month: '2025-11', total: 21000 },
]

export async function getIncomeStats() { return MOCK_INCOME }