import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import BackgroundCarousel from "../../component/BackgroundCarousel";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateFullName = (value: string): string => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (value.trim().length > 100) return "Name must be less than 100 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
    return "";
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(value)) return "Password must contain at least one special character (!@#$%^&*)";
    return "";
  };

  const validatePhoneNumber = (value: string): string => {
    if (!value.trim()) return "Phone number is required";
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) return "Please enter a valid phone number";
    return "";
  };

  const validateDateOfBirth = (value: string): string => {
    if (!value) return "Date of birth is required";
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge < 13) return "You must be at least 13 years old";
    if (actualAge > 120) return "Please enter a valid date of birth";
    return "";
  };

  const validateGender = (value: string): string => {
    if (!value) return "Gender is required";
    return "";
  };

  const validateAddress = (value: string): string => {
    if (!value.trim()) return "Address is required";
    if (value.trim().length < 5) return "Address must be at least 5 characters";
    if (value.trim().length > 200) return "Address must be less than 200 characters";
    return "";
  };

  // State for field errors
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  // Validate all fields
  const formErrors = useMemo(() => {
    return {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      phoneNumber: validatePhoneNumber(phoneNumber),
      dateOfBirth: validateDateOfBirth(dateOfBirth),
      gender: validateGender(gender),
      address: validateAddress(address),
    };
  }, [fullName, email, password, phoneNumber, dateOfBirth, gender, address]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      fullName.trim() &&
      email.trim() &&
      password &&
      phoneNumber.trim() &&
      dateOfBirth &&
      gender &&
      address.trim() &&
      Object.values(formErrors).every((error) => !error)
    );
  }, [fullName, email, password, phoneNumber, dateOfBirth, gender, address, formErrors]);

  const handleFieldChange = (
    value: string,
    setter: (val: string) => void,
    fieldName: keyof typeof errors,
    validator: (val: string) => string
  ) => {
    setter(value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: validator(value),
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName,
        email,
        password,
        phoneNumber,
        dateOfBirth,
        gender,
        address,
      });
      toast.success("Registration successful! Redirecting to dashboard...");
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        toast.error(e.response?.data?.message ?? "Registration failed");
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setIsSubmitting(false);
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
          py: 4,
        }}
      >
        <Paper
          sx={{ p: 4, borderRadius: 8, textAlign: "center", width: "100%" }}
          elevation={6}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            Patient Register
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              label="Full Name *"
              fullWidth
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={fullName}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  setFullName,
                  "fullName",
                  validateFullName
                )
              }
              error={!!errors.fullName}
              helperText={errors.fullName}
            />
            <TextField
              label="Email *"
              type="email"
              fullWidth
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={email}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  setEmail,
                  "email",
                  validateEmail
                )
              }
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Password *"
              type="password"
              fullWidth
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={password}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  setPassword,
                  "password",
                  validatePassword
                )
              }
              error={!!errors.password}
              helperText={errors.password || "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"}
            />
            <TextField
              label="Phone Number *"
              fullWidth
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={phoneNumber}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  setPhoneNumber,
                  "phoneNumber",
                  validatePhoneNumber
                )
              }
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              placeholder="(123) 456-7890"
            />
            <TextField
              label="Date of Birth *"
              type="appointmentDate"
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={dateOfBirth}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  setDateOfBirth,
                  "dateOfBirth",
                  validateDateOfBirth
                )
              }
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth}
            />
            <TextField
              label="Gender *"
              select
              fullWidth
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={gender}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  setGender,
                  "gender",
                  validateGender
                )
              }
              error={!!errors.gender}
              helperText={errors.gender}
            >
              <MenuItem value="">
                <em>Select gender...</em>
              </MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Address *"
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              value={address}
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  setAddress,
                  "address",
                  validateAddress
                )
              }
              error={!!errors.address}
              helperText={errors.address}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              sx={{ mt: 2, py: 1.5 }}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
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
