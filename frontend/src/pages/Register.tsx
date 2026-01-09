import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import BackgroundCarousel from "../components/BackgroundCarousel";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";

export default function Register() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) =>
    String(currentYear - i)
  );
  const monthOptions = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const dayOptions = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const dateOfBirth =
    dobYear && dobMonth && dobDay ? `${dobYear}-${dobMonth}-${dobDay}` : "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateOfBirthIso = dateOfBirth
        ? `${dateOfBirth}T00:00:00.000Z`
        : undefined;
      const payload = {
        fullName,
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        dateOfBirth: dateOfBirthIso,
        gender: gender || undefined,
        address: address || undefined,
      };
      await register(payload);
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        toast.error(e.response?.data?.message ?? "Register failed");
      } else {
        toast.error("Register failed");
      }
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <BackgroundCarousel />
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          sx={{ p: 4, borderRadius: 8, textAlign: "center" }}
          elevation={6}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Patient Register
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              required
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Phone Number"
              fullWidth
              required
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
              <TextField
                label="Year"
                select
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
              >
                <MenuItem value="">Year</MenuItem>
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Month"
                select
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
              >
                <MenuItem value="">Month</MenuItem>
                {monthOptions.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Day"
                select
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
              >
                <MenuItem value="">Day</MenuItem>
                {dayOptions.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              label="Gender"
              select
              fullWidth
              required
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </TextField>
            <TextField
              label="Address"
              fullWidth
              required
              multiline
              rows={3}
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Create Account
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
