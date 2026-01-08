import {useQuery} from "@tanstack/react-query";
import {getMyAppointments} from "../../api/appointments";
import {getMyRecords} from "../../api/medicalRecords";
import {getMyPrescriptions} from "../../api/prescriptions";
import {
    Button,
    Chip,
    Paper,
    Stack,
    Typography,
    Box,
    Container,
} from "@mui/material";
import {format} from "date-fns";
import {Link} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";

export default function Dashboard() {
    const {user} = useAuth();
    const {data: appointments = []} = useQuery({
        queryKey: ["myAppointments"],
        queryFn: getMyAppointments,
    });
    const {data: records = []} = useQuery({
        queryKey: ["records"],
        queryFn: getMyRecords,
    });
    const {data: prescriptions = []} = useQuery({
        queryKey: ["prescriptions"],
        queryFn: getMyPrescriptions,
    });

    return (
        <Container maxWidth="lg">
            <Stack spacing={3}>
                <Container maxWidth={false} sx={{mt: 4}}>
                    {/* Welcome Message */}
                    <Box sx={{width: "100%", textAlign: "center", my: 10}}>
                        <Typography variant="h5" sx={{fontWeight: 500}}>
                            Good to see you, {user?.fullName}.
                        </Typography>
                        <Typography variant="h5" sx={{fontWeight: 500}}>
                            Hope you're feeling well today!
                        </Typography>
                    </Box>
                </Container>

                {/* Appointment Section */}
                <Paper sx={{p: 3}}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{mb: 2, alignItems: "center"}}
                    >
                        <Typography variant="h6">Upcoming Appointments</Typography>
                        <Button
                            component={Link}
                            to="/appointments/book"
                            variant="contained"
                            size="small"
                        >
                            Book Appointment
                        </Button>
                    </Stack>
                    <Stack spacing={2}>
                        {appointments.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No appointments scheduled
                            </Typography>
                        ) : (
                            appointments.slice(0, 5).map((a) => (
                                <Paper key={a.id} sx={{p: 2, bgcolor: "background.default"}}>
                                    <Typography variant="subtitle1">{a.doctor.profile.fullName}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {format(new Date(a.appointmentDate), "PP")} - {a.timeSlot}
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{mt: 1}}
                                    >
                                        <Chip
                                            label={a.status}
                                            size="small"
                                            color={
                                                a.status === "Confirmed"
                                                    ? "success"
                                                    : a.status === "Cancelled"
                                                        ? "default"
                                                        : "warning"
                                            }
                                        />
                                    </Stack>
                                </Paper>
                            ))
                        )}
                        {appointments.length > 5 && (
                            <Button
                                component={Link}
                                to="/appointments"
                                variant="outlined"
                                fullWidth
                            >
                                View All Appointments
                            </Button>
                        )}
                    </Stack>
                </Paper>

                {/* Prescriptions Section */}
                <Paper sx={{p: 3}}>
                    <Stack direction="row" justifyContent="space-between" sx={{mb: 2}}>
                        <Typography variant="h6">My Prescriptions</Typography>
                        <Button component={Link} to="/prescriptions" variant="outlined" size="small">
                            View All
                        </Button>
                    </Stack>
                    <Stack spacing={2}>
                        {prescriptions.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No prescriptions available.
                            </Typography>
                        ) : (
                            prescriptions.slice(0, 3).map((p) => ( // Show 3 for brevity
                                <Paper
                                    key={p.prescriptionId}
                                    component={Link}
                                    // Correctly link to the detail page
                                    to={`/prescriptions/${p.prescriptionId}`}
                                    sx={{
                                        p: 2,
                                        bgcolor: "background.default",
                                        textDecoration: "none",
                                        color: 'inherit',
                                        transition: 'all 0.2s ease',
                                        "&:hover": {
                                            boxShadow: 2,
                                            transform: 'translateY(-2px)',
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                >
                                    <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                        {/* Display a clean summary of medication names */}
                                        {p.medications.map(m => m.name).join(', ')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {/* Display the doctor and issue date */}
                                        Prescribed by Dr. {p.doctorName} on {format(new Date(p.issueDate), "PP")}
                                    </Typography>
                                </Paper>
                            ))
                        )}
                    </Stack>
                </Paper>

                {/* Medical Records Section */}
                <Paper sx={{p: 3}}>
                    <Stack direction="row" justifyContent="space-between" sx={{mb: 2}}>
                        <Typography variant="h6">Medical Records</Typography>
                    </Stack>
                    <Stack spacing={2}>
                        {records.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No Medical Records available
                            </Typography>
                        ) : (
                            records.slice(0, 5).map((r) => (
                                <Paper
                                    key={r.recordId}
                                    component={Link}
                                    to={`/records/${r.recordId}`}
                                    sx={{
                                        p: 2,
                                        bgcolor: "background.default",
                                        textDecoration: "none",
                                        transition: 'all 0.2s ease',
                                        "&:hover": {
                                            boxShadow: 4,
                                            transform: 'translateY(-2px)',
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                >
                                    <Typography variant="subtitle1">{r.diagnosis}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {r.doctor?.fullName} - {r.doctor?.specialization || ''} -{" "}
                                        {r.createdAt ? format(new Date(r.createdAt), "PP") : "N/A"}
                                    </Typography>
                                </Paper>
                            ))
                        )}
                        {records.length > 5 && (
                            <Button
                                component={Link}
                                to="/records"
                                variant="outlined"
                                fullWidth
                            >
                                View All Medical Records
                            </Button>
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
