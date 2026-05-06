import React from 'react';
import { Users, UserCheck, Map } from 'lucide-react';

export default function ServiceStats() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900">500+</h3>
                        <p className="text-slate-600 font-medium">Verified Workers</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                        <UserCheck size={32} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900">1000+</h3>
                        <p className="text-slate-600 font-medium">Happy Customers</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-full text-amber-500">
                        <Users size={32} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900">20+</h3>
                        <p className="text-slate-600 font-medium">Pincodes Covered</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-full text-green-600">
                        <Map size={32} />
                    </div>
                </div>
            </div>
        </div>
    );
}
