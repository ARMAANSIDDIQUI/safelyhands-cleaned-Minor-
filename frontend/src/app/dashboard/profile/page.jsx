"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Home, Lock, Key, Eye, EyeOff } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { getToken, saveSession } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProfilePage() {
    const { user, logout, loading, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        profilePicture: ""
    });


    // Sync form data when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                profilePicture: user.profilePicture || ""
            });
        }

    }, [user]);

    // Phone missing modal state
    const [showPhoneModal, setShowPhoneModal] = useState(false);

    useEffect(() => {
        if (user && !user.phone) {
            setShowPhoneModal(true);
        } else {
            setShowPhoneModal(false);
        }
    }, [user]);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loadingResult, setLoadingResult] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSave = async () => {
        // Validate phone is exactly 10 digits if provided
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        try {
            setLoadingResult(true);
            const token = getToken();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // API returns user data directly with a new token
            const newToken = data.token || token;
            const userData = {
                _id: data._id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: data.role,
                isGoogleUser: data.isGoogleUser,
                profilePicture: data.profilePicture
            };

            // Update user in context
            if (setUser) {
                setUser(userData);
            }
            // saveSession expects (userData, token) - NOT (token, userData)!
            saveSession(userData, newToken);

            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoadingResult(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setLoadingResult(true);
            const token = getToken();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update password");
            }

            toast.success("Password updated successfully!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Password update error:", error);
            toast.error(error.message || "Failed to update password");
        } finally {
            setLoadingResult(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-[400px] rounded-xl" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h2>
                    <p className="text-muted-foreground">Manage your account settings</p>
                </div>
                <Button variant="outline" asChild className="w-fit">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" /> Back to Site
                    </Link>
                </Button>
            </div>

            {/* Verification Warning */}
            {!user?.isVerified && !user?.isGoogleUser && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Shield className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your email is not verified. Please verify to access all features.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                try {
                                    setLoadingResult(true);
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email: user.email })
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        toast.success(data.message);
                                        // Redirect to OTP verification page or open modal (implementation depends on existing flow)
                                        // For now, assuming user knows where to enter OTP or we simple redirect
                                        window.location.href = `/verify-email?email=${encodeURIComponent(user.email)}`;
                                    } else {
                                        toast.error(data.message);
                                    }
                                } catch (error) {
                                    toast.error("Failed to send verification email");
                                } finally {
                                    setLoadingResult(false);
                                }
                            }}
                            disabled={loadingResult}
                            className="bg-white text-yellow-700 hover:bg-yellow-50 border-yellow-300"
                        >
                            {loadingResult ? "Sending..." : "Verify Email"}
                        </Button>
                    </div>
                </div>
            )}

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="profile">
                        <User className="mr-2 h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield className="mr-2 h-4 w-4" /> Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>
                                Update your personal information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-lg">{user?.name}</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {user?.role || "User"} Account
                                            {user?.isGoogleUser && " • Google"}
                                        </p>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="max-w-md">
                                        <Label className="mb-2 block">Profile Picture</Label>
                                        <ImageUpload
                                            value={formData.profilePicture}
                                            onChange={(url) => setFormData({ ...formData, profilePicture: url })}
                                            disabled={loadingResult}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            className="pl-9"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="pl-9"
                                            placeholder="Your email"
                                            value={formData.email}
                                            disabled
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 rounded-l-md text-sm text-muted-foreground font-medium">
                                            +91
                                        </span>
                                        <Input
                                            id="phone"
                                            className="rounded-l-none"
                                            placeholder="9876543210"
                                            maxLength={10}
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setFormData({ ...formData, phone: digitsOnly });
                                            }}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {isEditing ? (
                                        <>
                                            <Button onClick={handleSave} disabled={loadingResult}>
                                                {loadingResult ? "Saving..." : "Save Changes"}
                                            </Button>
                                            <Button variant="outline" onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    name: user?.name || "",
                                                    email: user?.email || "",
                                                    phone: user?.phone || "",
                                                    profilePicture: user?.profilePicture || ""
                                                });
                                            }}>
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setIsEditing(true)}>
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password Management</CardTitle>
                            <CardDescription>
                                {user?.isGoogleUser
                                    ? "Set a password to login with email in addition to Google"
                                    : "Change your account password"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                                {!user?.isGoogleUser && (
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                className="pl-9 pr-10"
                                                placeholder="Enter current password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            className="pl-9 pr-10"
                                            placeholder="Enter new password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="pl-9 pr-10"
                                            placeholder="Confirm new password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <Button type="submit" disabled={loadingResult}>
                                    {loadingResult ? "Updating..." : "Update Password"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Complete Profile Dialog for missing Phone */}
            <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Your Profile</DialogTitle>
                        <DialogDescription>
                            Please provide a valid 10-digit phone number to continue using all features of SafelyHands.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-2">
                            <Label htmlFor="modal-phone">Phone Number</Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 rounded-l-md text-sm text-muted-foreground font-medium">
                                    +91
                                </span>
                                <Input
                                    id="modal-phone"
                                    className="rounded-l-none"
                                    placeholder="10-digit number"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData({ ...formData, phone: digitsOnly });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleSave}
                            disabled={loadingResult || !formData.phone || formData.phone.length !== 10}
                        >
                            {loadingResult ? "Saving..." : "Save Phone Number"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
