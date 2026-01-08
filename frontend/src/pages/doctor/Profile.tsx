import { Button, Paper, TextField, Typography, Container, Stack, Avatar, Box, Divider, Grid, IconButton } from '@mui/material'
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import { useEffect, useRef, useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { useDoctorAuth } from '../../context/DoctorAuthContext'
import { http } from '../../api/http'

export default function DoctorProfile() {
    const { doctor, refresh } = useDoctorAuth()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [specialization, setSpecialization] = useState('')
    const [bio, setBio] = useState('')
    const [yearsOfExperience, setYearsOfExperience] = useState('')
    const [licenseNumber, setLicenseNumber] = useState('')
    const [consultationFee, setConsultationFee] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [avatarHovered, setAvatarHovered] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Error states
    const [errors, setErrors] = useState({
        fullName: '',
        phone: '',
        specialization: '',
        yearsOfExperience: '',
        bio: '',
        consultationFee: ''
    })

    // Validation functions
    const validateFullName = (value: string): string => {
        if (!value.trim()) return 'Full name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        if (value.trim().length > 100) return 'Name must be less than 100 characters'
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens, and apostrophes'
        return ''
    }

    const validatePhone = (value: string): string => {
        if (!value.trim()) return 'Phone number is required'
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number'
        return ''
    }

    const validateSpecialization = (value: string): string => {
        if (!value.trim()) return 'Specialization is required'
        if (value.trim().length < 2) return 'Specialization must be at least 2 characters'
        if (value.trim().length > 100) return 'Specialization must be less than 100 characters'
        return ''
    }

    const validateYearsOfExperience = (value: string): string => {
        if (!value) return 'Years of experience is required'
        const num = Number(value)
        if (isNaN(num)) return 'Years of experience must be a number'
        if (num < 0) return 'Years of experience cannot be negative'
        if (num > 70) return 'Years of experience seems too high'
        if (!Number.isInteger(num)) return 'Years of experience must be a whole number'
        return ''
    }

    const validateBio = (value: string): string => {
        if (!value.trim()) return 'Biography is required'
        if (value.trim().length < 10) return 'Biography must be at least 10 characters'
        if (value.trim().length > 1000) return 'Biography must be less than 1000 characters'
        return ''
    }

    const validateConsultationFee = (value: string): string => {
        if (!value) return 'Consultation fee is required'
        const num = Number(value)
        if (isNaN(num)) return 'Consultation fee must be a number'
        if (num < 0) return 'Consultation fee cannot be negative'
        if (num > 100000) return 'Consultation fee seems too high'
        return ''
    }

    // Validate all fields
    const formErrors = useMemo(() => {
        return {
            fullName: validateFullName(fullName),
            phone: validatePhone(phone),
            specialization: validateSpecialization(specialization),
            yearsOfExperience: validateYearsOfExperience(yearsOfExperience),
            bio: validateBio(bio),
            consultationFee: validateConsultationFee(consultationFee)
        }
    }, [fullName, phone, specialization, yearsOfExperience, bio, consultationFee])

    // Check if form is valid
    const isFormValid = useMemo(() => {
        return (
            fullName.trim() &&
            phone.trim() &&
            specialization.trim() &&
            yearsOfExperience &&
            bio.trim() &&
            consultationFee &&
            Object.values(formErrors).every(error => !error)
        )
    }, [fullName, phone, specialization, yearsOfExperience, bio, consultationFee, formErrors])

    const handleFieldChange = (
        value: string,
        setter: (val: string) => void,
        fieldName: keyof typeof errors,
        validator: (val: string) => string
    ) => {
        setter(value)
        setErrors(prev => ({
            ...prev,
            [fieldName]: validator(value)
        }))
    }

    useEffect(() => {
        if (doctor) {
            setFullName(doctor.profile.fullName || '')
            setEmail(doctor.profile.email || '')
            setPhone(doctor.profile.phoneNumber || '')
            setSpecialization(doctor.specialization || '')
            setBio(doctor.bio || doctor.biography || '')
            setYearsOfExperience(doctor.yearsOfExperience?.toString() || '')
            setLicenseNumber(doctor.licenseNumber || '')
            setConsultationFee(doctor.consultationFee?.toString() || '')
            setAvatarUrl(doctor.profile.avatarUrl || null)
        }
    }, [doctor])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file')
                return
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB')
                return
            }
            try {
                const formData = new FormData()
                formData.append('file', file)
                
                // Use the auth upload endpoint which returns a signed S3 URL
                const response = await http.post('/auth/upload-picture', formData)
                console.log('Upload response:', response.data)
                
                // The auth endpoint returns fileUrl (signed S3 URL)
                const uploadedUrl = response.data.fileUrl
                console.log('Uploaded URL:', uploadedUrl)
                
                if (!uploadedUrl) {
                    console.error('No URL in upload response:', response.data)
                    toast.error('Upload failed: no URL returned')
                    return
                }
                
                setAvatarUrl(uploadedUrl)
                toast.success('Profile Picture Updated')
            } catch (error) {
                toast.error('Failed to upload profile picture')
                console.error(error)
            }
        }
    }

    const onSave = async () => {
        if (!isFormValid) {
            toast.error('Please fix the errors in the form')
            return
        }

        setIsSubmitting(true)
        try {
            const updateData = {
                fullName,
                phoneNumber: phone,
                profileImageUrl: avatarUrl,
                specialization, 
                biography: bio,
                yearsOfExperience: Number(yearsOfExperience),
                consultationFee: Number(consultationFee)
            }
            
            console.log('Sending update data:', updateData)
            const response = await http.put('/doctors/profile', updateData)
            console.log('Response:', response.data)
            
            if (response.status === 200 && response.data) {
                // Refresh the doctor context to get the latest data
                await refresh()
                toast.success('Profile updated successfully')
            }
        } catch (error: any) {
            let errorMessage = 'Failed to update profile'
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.response?.data?.errors) {
                // Handle validation errors
                errorMessage = Object.entries(error.response.data.errors)
                    .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
                    .join(', ')
            }
            toast.error(errorMessage)
            console.error('Update error:', error.response?.data || error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!doctor) {
        return <Typography>Loading...</Typography>
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'center' }}>
                    <Box
                        onMouseEnter={() => setAvatarHovered(true)}
                        onMouseLeave={() => setAvatarHovered(false)}
                        sx={{ position: "relative", flexShrink: 0 }}
                    >
                        <Avatar
                        src={avatarUrl || undefined}
                        alt={doctor.profile.fullName}
                        sx={{
                            width: 150,
                            height: 150,
                            transition: "opacity 0.3s ease",
                            opacity: avatarHovered ? 0.7 : 1,
                            flexShrink: 0
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
                        hidden
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                            Dr. {doctor.profile.fullName}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                            {specialization}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            License: {licenseNumber}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Edit Profile
                </Typography>

                <Stack spacing={2}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Full Name *" 
                                fullWidth 
                                value={fullName} 
                                onChange={e => handleFieldChange(e.target.value, setFullName, 'fullName', validateFullName)}
                                error={!!errors.fullName}
                                helperText={errors.fullName}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Email" 
                                fullWidth 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                disabled 
                                helperText="Email cannot be changed"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Phone *" 
                                fullWidth 
                                value={phone} 
                                onChange={e => handleFieldChange(e.target.value, setPhone, 'phone', validatePhone)}
                                error={!!errors.phone}
                                helperText={errors.phone}
                                placeholder="(123) 456-7890"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Specialization *" 
                                fullWidth 
                                value={specialization} 
                                onChange={e => handleFieldChange(e.target.value, setSpecialization, 'specialization', validateSpecialization)}
                                error={!!errors.specialization}
                                helperText={errors.specialization}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="License Number" 
                                fullWidth 
                                value={licenseNumber} 
                                disabled
                                helperText="License number cannot be changed"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Years of Experience *" 
                                fullWidth 
                                type="number"
                                value={yearsOfExperience} 
                                onChange={e => handleFieldChange(e.target.value, setYearsOfExperience, 'yearsOfExperience', validateYearsOfExperience)}
                                error={!!errors.yearsOfExperience}
                                helperText={errors.yearsOfExperience}
                                inputProps={{ min: '0', max: '70' }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label="Biography *" 
                                fullWidth 
                                multiline 
                                minRows={4}
                                maxRows={8}
                                value={bio} 
                                onChange={e => handleFieldChange(e.target.value, setBio, 'bio', validateBio)}
                                error={!!errors.bio}
                                helperText={errors.bio || `${bio.length}/1000 characters`}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Consultation Fee ($) *" 
                                fullWidth 
                                type="number"
                                value={consultationFee} 
                                onChange={e => handleFieldChange(e.target.value, setConsultationFee, 'consultationFee', validateConsultationFee)}
                                error={!!errors.consultationFee}
                                helperText={errors.consultationFee}
                                inputProps={{ step: "0.01", min: "0" }}
                            />
                        </Grid>
                    </Grid>
                </Stack>

                <Button 
                    variant="contained" 
                    onClick={onSave}
                    disabled={!isFormValid || isSubmitting}
                    sx={{ mt: 3, px: 4, py: 1 }}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </Paper>
        </Container>
    )
}

