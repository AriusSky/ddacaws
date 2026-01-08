import { Card, CardContent, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getIncomeStats } from '../../api/doctor/income'

export default function DoctorIncome() {
    const { data = [] } = useQuery({ queryKey: ['doctorIncome'], queryFn: getIncomeStats })
    const totalYtd = data.reduce((sum, item) => sum + item.total, 0)

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Income Overview</Typography>
                <Typography variant="h4" sx={{ mb: 3 }}>${totalYtd.toLocaleString()}</Typography>
                <div style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Area type="monotone" dataKey="total" stroke="#1976d2" fillOpacity={1} fill="url(#incomeColor)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

