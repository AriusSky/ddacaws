// frontend/src/api/healthMetrics.ts
import { http } from './http';
import type {ChartData} from "recharts/types/state/chartDataSlice";

// API function to fetch the chart data
export async function getHealthChartData(days: number, metricType: string): Promise<ChartData> {
    const response = await http.get('/health-metrics/chart', {
        params: {
            days,
            metricType,
        },
    });
    return response.data;
}
