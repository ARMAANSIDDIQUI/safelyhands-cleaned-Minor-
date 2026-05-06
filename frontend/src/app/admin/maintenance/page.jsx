"use client";

import React, { useState } from "react";
import { Database, CloudUpload, AlertTriangle, CheckCircle2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getToken } from "@/lib/auth";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function MaintenancePage() {
    const [seeding, setSeeding] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [isSeedConfirmOpen, setIsSeedConfirmOpen] = useState(false);
    const [isMigrateConfirmOpen, setIsMigrateConfirmOpen] = useState(false);

    const handleSeed = async () => {
        setIsSeedConfirmOpen(false);

        setSeeding(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenance/seed`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
            } else {
                toast.error(data.message || "Seeding failed");
            }
        } catch (error) {
            toast.error("Network error during seeding");
        } finally {
            setSeeding(false);
        }
    };

    const handleMigrate = async () => {
        setIsMigrateConfirmOpen(false);

        setMigrating(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenance/migrate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Migration completed successfully!");
            } else {
                toast.error(data.message || "Migration failed");
            }
        } catch (error) {
            toast.error("Network error during migration");
        } finally {
            setMigrating(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900">System Maintenance</h1>
                <p className="text-slate-500 mt-2">Manage database state and production deployments.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Seeding Card */}
                <Card className="border-blue-100 bg-blue-50/20">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                            <Database size={24} />
                        </div>
                        <CardTitle>Seed Defaults</CardTitle>
                        <CardDescription>
                            Reset services, team members, and investors to original templates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-white/60 p-4 rounded-lg border border-blue-100 text-sm text-slate-600 flex gap-3">
                            <Info size={18} className="text-blue-500 shrink-0" />
                            <p>Useful for first-time setups or if you want to restore the official broomees.com service list.</p>
                        </div>
                        <Button
                            onClick={() => setIsSeedConfirmOpen(true)}
                            disabled={seeding || migrating}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {seeding ? <Loader2 className="mr-2 animate-spin" /> : <CheckCircle2 className="mr-2" size={18} />}
                            Trigger Seeding
                        </Button>
                    </CardContent>
                </Card>

                {/* Migration Card */}
                <Card className="border-amber-100 bg-amber-50/20">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                            <CloudUpload size={24} />
                        </div>
                        <CardTitle>Sync to Atlas</CardTitle>
                        <CardDescription>
                            Move your local database records to MongoDB Atlas production cloud.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-amber-100/50 p-4 rounded-lg border border-amber-200 text-sm text-amber-900 flex gap-3">
                            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                            <p><strong>Warning:</strong> This wipes the cloud database before uploading. Use with caution!</p>
                        </div>
                        <Button
                            onClick={() => setIsMigrateConfirmOpen(true)}
                            disabled={seeding || migrating}
                            variant="outline"
                            className="w-full border-amber-200 text-amber-700 hover:bg-amber-100"
                        >
                            {migrating ? <Loader2 className="mr-2 animate-spin" /> : <CloudUpload className="mr-2" size={18} />}
                            Migrate Data to Cloud
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={isSeedConfirmOpen}
                onOpenChange={setIsSeedConfirmOpen}
                onConfirm={handleSeed}
                title="Trigger Seeding?"
                description="This will wipe existing services/team data and reload from defaults! This action cannot be undone."
                confirmText="Seed Database"
                loading={seeding}
            />

            <ConfirmDialog
                open={isMigrateConfirmOpen}
                onOpenChange={setIsMigrateConfirmOpen}
                onConfirm={handleMigrate}
                title="Migrate to Atlas?"
                description="DANGER: This will wipe your MongoDB Atlas data and replace it with local data. Use with extreme caution!"
                confirmText="Migrate Now"
                loading={migrating}
            />
        </div>
    );
}
