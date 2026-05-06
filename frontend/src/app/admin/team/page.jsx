"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, UserCheck, UserPlus, Loader2, Mail, Briefcase, IdCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamMembersTab from "@/components/admin/TeamMembersTab";
import TeamCategoriesTab from "@/components/admin/TeamCategoriesTab";

export default function TeamManagement() {
    const { user } = useAuth();
    const [adminLoading, setAdminLoading] = useState(false);
    const [workerLoading, setWorkerLoading] = useState(false);
    const [adminEmail, setAdminEmail] = useState("");

    const [workerForm, setWorkerForm] = useState({
        name: "",
        profession: "",
        email: ""
    });
    const [generatedId, setGeneratedId] = useState(null);

    const handlePromoteAdmin = async (e) => {
        e.preventDefault();
        if (!adminEmail) return;

        setAdminLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/promote-admin`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({ email: adminEmail })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setAdminEmail("");
            } else {
                toast.error(data.message || "Failed to promote user");
            }
        } catch (error) {
            toast.error("Error promoting user");
        } finally {
            setAdminLoading(false);
        }
    };

    const handleCreateWorkerId = async (e) => {
        e.preventDefault();
        setWorkerLoading(true);
        setGeneratedId(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers/create-id`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify(workerForm)
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Worker ID Generated!");
                setGeneratedId(data.workerId);
                setWorkerForm({ name: "", profession: "", email: "" });
            } else {
                toast.error(data.message || "Failed to create worker ID");
            }
        } catch (error) {
            toast.error("Error generating worker ID");
        } finally {
            setWorkerLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900">Team Management</h1>
                <p className="text-slate-500 mt-2">Manage your team members, positions, and administrative settings.</p>
            </div>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="positions">Positions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                    <TeamMembersTab />
                </TabsContent>

                <TabsContent value="positions" className="space-y-4">
                    <TeamCategoriesTab />
                </TabsContent>

                <TabsContent value="settings" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Admin Promotion Card */}
                        <Card className="border-blue-100 shadow-sm">
                            <CardHeader className="bg-blue-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <UserCheck size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Promote to Admin</CardTitle>
                                        <CardDescription>Grant full access to a user</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handlePromoteAdmin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">User Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="user@example.com"
                                                className="pl-10"
                                                value={adminEmail}
                                                onChange={(e) => setAdminEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        disabled={adminLoading}
                                    >
                                        {adminLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        Promote to Admin
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Worker ID Generation Card */}
                        <Card className="border-purple-100 shadow-sm">
                            <CardHeader className="bg-purple-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                        <UserPlus size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Register Worker ID</CardTitle>
                                        <CardDescription>Generate unique ID for attendance</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleCreateWorkerId} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="workerName">Worker Name</Label>
                                        <Input
                                            id="workerName"
                                            placeholder="Full Name"
                                            value={workerForm.name}
                                            onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profession">Profession</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <Input
                                                id="profession"
                                                placeholder="e.g. Cook, Driver"
                                                className="pl-10"
                                                value={workerForm.profession}
                                                onChange={(e) => setWorkerForm({ ...workerForm, profession: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="workerEmail">Email (Optional)</Label>
                                        <Input
                                            id="workerEmail"
                                            type="email"
                                            placeholder="For login access"
                                            value={workerForm.email}
                                            onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                        disabled={workerLoading}
                                    >
                                        {workerLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        Generate Worker ID
                                    </Button>

                                    {generatedId && (
                                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Generated ID</p>
                                                <p className="text-xl font-mono font-bold text-green-700">{generatedId}</p>
                                            </div>
                                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                                <IdCard size={24} />
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Warning Section */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                        <div className="shrink-0 p-2 bg-amber-100 rounded-full h-fit text-amber-600">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">Safety Warning</h3>
                            <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                                Promoting a user to Admin grants them full control over bookings, workers, and financial settings.
                                Worker IDs are permanent identifiers used for payroll and attendance tracking—ensure names match government IDs for accuracy.
                            </p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
