"use client"

import { useState } from "react"
import { Registration, RegistrationStatus } from "@/types"
import { RegistrationTable } from "@/components/events/registrations/RegistrationTable"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Mock Data
const mockRegistrations: Registration[] = [
    {
        id: "1",
        eventId: "1",
        user: {
            name: "John Doe",
            email: "john@example.com",
            avatarUrl: "https://ui-avatars.com/api/?name=John+Doe&background=random"
        },
        registrationDate: "2025-12-01",
        status: "registered",
        ticketType: "General Admission"
    },
    {
        id: "2",
        eventId: "1",
        user: {
            name: "Jane Smith",
            email: "jane@example.com",
            avatarUrl: "https://ui-avatars.com/api/?name=Jane+Smith&background=random"
        },
        registrationDate: "2025-12-02",
        status: "checked-in",
        ticketType: "VIP",
        checkInTime: "2025-12-15 10:30 AM"
    },
    {
        id: "3",
        eventId: "1",
        user: {
            name: "Alex Johnson",
            email: "alex@example.com",
        },
        registrationDate: "2025-12-03",
        status: "cancelled",
        ticketType: "General Admission"
    },
    {
        id: "4",
        eventId: "1",
        user: {
            name: "Sarah Williams",
            email: "sarah@example.com",
            avatarUrl: "https://ui-avatars.com/api/?name=Sarah+Williams&background=random"
        },
        registrationDate: "2025-12-04",
        status: "registered",
        ticketType: "VIP"
    },
    {
        id: "5",
        eventId: "1",
        user: {
            name: "Mike Brown",
            email: "mike@example.com",
        },
        registrationDate: "2025-12-05",
        status: "registered",
        ticketType: "General Admission"
    }
]

const RegistrationList = () => {
    const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch =
            reg.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || reg.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleStatusChange = (id: string, newStatus: RegistrationStatus) => {
        setRegistrations(prev => prev.map(reg =>
            reg.id === id ? { ...reg, status: newStatus } : reg
        ))
    }

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this registration?")) {
            setRegistrations(prev => prev.filter(reg => reg.id !== id))
        }
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold text-white">Registration Management</h1>
                <p className="text-white/60">Manage attendees, check-ins, and registration details.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-black/20 border-white/10 text-white h-10">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                <SelectValue placeholder="Filter by Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/10 text-white">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="registered">Registered</SelectItem>
                            <SelectItem value="checked-in">Checked In</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="bg-black/20 border-white/10 text-white hover:bg-white/10 h-10">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <RegistrationTable
                data={filteredRegistrations}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default RegistrationList;