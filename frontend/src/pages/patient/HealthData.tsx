import {useQuery} from "@tanstack/react-query";
import {
    Card,
    CardContent,
    Typography,
    Container,
    Stack,
    Box,
    CircularProgress,
    TextField,
    MenuItem,
} from "@mui/material";
import {useState} from "react";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from 'recharts';
import {getHealthChartData} from "../../api/healthMetrics"; // Import our new API function
import type {ChartData} from "../../types.ts";

// Define the available metric types for the user to select
const metricOptions = [
    {value: 'heartrate', label: 'Heart Rate (bpm)'},
    {value: 'weight', label: 'Weight (kg)'},
    {value: 'bloodsugar', label: 'Blood Sugar (mmol/L)'},
    {value: 'bloodpressuresystolic', label: 'Blood Pressure (Systolic)'},
    {value: 'bloodpressurediastolic', label: 'Blood Pressure (Diastolic)'},
    {value: 'temperature', label: 'Temperature (°C)'},
];

export default function HealthData() {
    // State for user selections
    const [selectedMetric, setSelectedMetric] = useState('heartrate');
    const [timeRange, setTimeRange] = useState(30); // Default to 30 days

    // Use react-query to fetch chart data based on user selections
    const {data: chartData, isLoading, isError} = useQuery<ChartData>({
        // The query key includes the metric and time range, so it refetches when they change
        queryKey: ['healthChart', selectedMetric, timeRange],
        queryFn: () => getHealthChartData(timeRange, selectedMetric),
    });

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Typography variant="h5" sx={{fontWeight: 600, mb: 3}}>
                My Health Trends
            </Typography>

            <Card>
                <CardContent>
                    {/* --- CONTROLS FOR THE USER --- */}
                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{mb: 4}}>
                        <TextField
                            select
                            label="Metric"
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            sx={{minWidth: 200}}
                        >
                            {metricOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Time Range"
                            value={timeRange}
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                            sx={{minWidth: 150}}
                        >
                            <MenuItem value={7}>Last 7 Days</MenuItem>
                            <MenuItem value={30}>Last 30 Days</MenuItem>
                            <MenuItem value={90}>Last 90 Days</MenuItem>
                        </TextField>
                    </Stack>

                    {/* --- CHART DISPLAY AREA --- */}
                    <Box sx={{height: 400, width: '100%'}}>
                        {isLoading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                                <CircularProgress/>
                            </Box>
                        ) : isError ? (
                            <Typography color="error">Failed to load chart data.</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data ={chartData?.data.map((value, index) => ({
                                    name: chartData.labels[index],
                                    value: value
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="name"/>
                                    <YAxis label={{value: chartData?.unit, angle: -90, position: 'insideLeft'}}/>
                                    <Tooltip formatter={(value) => [`${value} ${chartData?.unit}`, selectedMetric]}/>
                                    <Legend/>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#8884d8"
                                        name={metricOptions.find(m => m.value === selectedMetric)?.label || 'Value'}
                                        activeDot={{r: 8}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}
