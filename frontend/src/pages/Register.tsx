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
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        fullName,
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        address: address || undefined,
        userRole:"Admin"
      });
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
            <TextField
              label="Date of Birth"
              type="appointmentDate"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
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
