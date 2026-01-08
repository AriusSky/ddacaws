import {
  Avatar,
  Box,
  Button,
  Paper,
  TextField,
  MenuItem,
  Container,
  IconButton,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useMemo } from "react";
import { updateProfile, uploadProfileImage } from "../../api/auth";
import { toast } from "react-toastify";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  
  // Convert ISO appointmentDate string to yyyy-MM-dd format for the appointmentDate input
  const formatDateForInput = (dateStr?: string): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateStr;
    }
  };

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const email = user?.email ?? "";
  const gender = user?.gender ?? "";
  const dateOfBirth = formatDateForInput(user?.dateOfBirth);
  const [phone, setPhone] = useState(user?.phoneNumber ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation functions
  const validateFullName = (value: string): string => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (value.trim().length > 100) return "Name must be less than 100 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
    return "";
  };

  const validatePhone = (value: string): string => {
    if (!value.trim()) return "Phone number is required";
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) return "Please enter a valid phone number";
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
    gender: "",
    dateOfBirth: "",
    phone: "",
    address: "",
  });

  // Validate all fields
  const formErrors = useMemo(() => {
    return {
      fullName: validateFullName(fullName),
      phone: validatePhone(phone),
      address: validateAddress(address),
    };
  }, [fullName, phone, address]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      fullName.trim() &&
      phone.trim() &&
      address.trim() &&
      Object.values(formErrors).every((error) => !error)
    );
  }, [fullName, phone, address, formErrors]);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      try {
        toast.info("Uploading profile picture...");
        const result = await uploadProfileImage(file);
        // Update the profile with the new image URL
        await updateProfile({
          fullName,
          email,
          gender,
          dateOfBirth,
          phoneNumber: phone,
          address,
          avatarUrl: result.fileUrl
        });
        await refreshProfile();
        toast.success("Profile Picture Updated");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload profile picture");
      }
    }
  };

  const onSave = async () => {
    if (!isFormValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        fullName,
        email,
        gender,
        dateOfBirth,
        phoneNumber: phone,
        address,
      });
      await refreshProfile();
      toast.success("Profile Updated");
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || "Update Failed";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 10 }}>
      <Paper
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 8,
        }}
        elevation={6}
      >
        <Box
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          sx={{ position: "relative", mb: 6 }}
        >
          <Avatar
            src={user?.avatarUrl}
            sx={{
              width: 150,
              height: 150,
              transition: "opacity 0.3s ease",
              opacity: avatarHovered ? 0.7 : 1,
            }}
          />
          {avatarHovered && (
            <IconButton
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraAltIcon />
            </IconButton>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
        </Box>
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
          fullWidth
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
          value={email}
          disabled
        />
        <TextField
          label="Gender *"
          select
          fullWidth
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
          value={gender}
          disabled
        >
          <MenuItem value="">
            <em>Select gender...</em>
          </MenuItem>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
        <TextField
          label="Date of Birth *"
          type="appointmentDate"
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
          value={dateOfBirth}
          disabled
        />
        <TextField
          label="Phone *"
          fullWidth
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
          value={phone}
          onChange={(e) =>
            handleFieldChange(
              e.target.value,
              setPhone,
              "phone",
              validatePhone
            )
          }
          error={!!errors.phone}
          helperText={errors.phone}
          placeholder="(123) 456-7890"
        />
        <TextField
          label="Address *"
          fullWidth
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
          variant="contained"
          onClick={onSave}
          disabled={!isFormValid || isSubmitting}
          sx={{ alignSelf: "center", mt: 2, borderRadius: 2, px: 4, py: 1 }}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </Paper>
    </Container>
  );
}
