"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { RegistrationTable } from "@/components/events/registrations/RegistrationTable"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, Loader2, ArrowLeft } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useGetEventAttendeesWithAccounts } from "@/hooks/sui/useGetEventAttendees"
import { useGetEventById } from "@/hooks/sui/useGetAllEvents"
import Link from "next/link"
import { RegistrationStatus, Registration } from "@/types"

const RegistrationList = () => {
    const params = useParams()
    const eventId = params?.id as string

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    // Fetch event details and attendees with accounts
    const { event, isLoading: eventLoading } = useGetEventById(eventId)

    const {
        attendees,
        isLoading: attendeesLoading,
        registrationFields,
        summary,
        error: attendeesError
    } = useGetEventAttendeesWithAccounts(eventId)
    console.log(attendees)

    const isLoading = eventLoading || attendeesLoading

    // Transform attendee data to match Registration interface
    const registrations: Registration[] = useMemo(() => {
        return attendees.map((attendee) => {
            // Determine status
            let status: RegistrationStatus = 'registered'
            if (attendee.checkedIn) {
                status = 'checked-in'
            }

            // Format check-in time
            const checkInTime = attendee.checkedInAt
                ? new Date(attendee.checkedInAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                })
                : undefined

            // Format registration date
            const registrationDate = new Date(attendee.registeredAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })

            // Get ticket type from tier index or custom fields
            const ticketType = event?.ticket_tiers?.[attendee.ticketTierIndex]?.name
                || attendee.registrationValues['Ticket Type']
                || attendee.registrationValues['ticket_type']
                || 'General Admission';

            return {
                id: attendee.address,
                eventId: eventId,
                user: {
                    name: attendee.name,
                    email: attendee.email,
                    avatarUrl: attendee.avatarUrl
                },
                registrationDate,
                status,
                ticketType,
                checkInTime,
                address: attendee.address,
                registrationData: attendee.registrationValues,
                nftMinted: attendee.nftMinted,
            }
        })
    }, [attendees, eventId, event])

    // Filter registrations
    const filteredRegistrations = useMemo(() => {
        return registrations.filter(reg => {
            const matchesSearch =
                reg.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                reg.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                reg.address?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = statusFilter === "all" || reg.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [registrations, searchQuery, statusFilter])

    // Export to CSV
    const handleExport = () => {
        if (filteredRegistrations.length === 0) {
            alert('No registrations to export')
            return
        }

        try {
            // Create CSV headers
            const headers = ['Name', 'Email', 'Address', 'Registration Date', 'Status', 'Check-in Time', 'NFT Minted']

            // Add custom registration fields
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            registrationFields.forEach((field: any) => {
                if (!['Name', 'Email', 'name', 'email'].includes(field.name)) {
                    headers.push(field.name)
                }
            })

            // Create CSV rows
            const rows = filteredRegistrations.map(reg => {
                const row = [
                    reg.user.name,
                    reg.user.email,
                    reg.address || '',
                    reg.registrationDate,
                    reg.status,
                    reg.checkInTime || '',
                    reg.nftMinted ? 'Yes' : 'No'
                ]

                // Add custom field values
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                registrationFields.forEach((field: any) => {
                    if (!['Name', 'Email', 'name', 'email'].includes(field.name)) {
                        row.push(reg.registrationData?.[field.name] || '')
                    }
                })

                return row
            })

            // Combine headers and rows
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
            ].join('\n')

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `${event?.title || 'event'}-registrations-${Date.now()}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error exporting CSV:', error)
            alert('Failed to export CSV. Please try again.')
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="text-white/60">Loading registrations...</p>
            </div>
        )
    }

    if (attendeesError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-red-400">Error loading registrations</p>
                <p className="text-white/60 text-sm">{attendeesError.message}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href={`/events/${eventId}`}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Event
                </Link>
                <div>
                    <h1 className="text-4xl font-bold text-white">{event?.title || 'Event'}</h1>
                    <p className="text-white/60 mt-2">Registration Management</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-white/60 text-sm">Total Registrations</p>
                    <p className="text-3xl font-bold text-white mt-2">{summary?.total || 0}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-white/60 text-sm">Checked In</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">{summary?.checkedIn || 0}</p>
                    <p className="text-white/40 text-xs mt-1">
                        {summary && summary.total > 0 ? Math.round((summary.checkedIn / summary.total) * 100) : 0}% of total
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-white/60 text-sm">NFTs Minted</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">{summary?.nftMinted || 0}</p>
                    <p className="text-white/40 text-xs mt-1">
                        {summary && summary.checkedIn > 0 ? Math.round((summary.nftMinted / summary.checkedIn) * 100) : 0}% of checked-in
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                        placeholder="Search by name, email, or address..."
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
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="bg-black/20 border-white/10 text-white hover:bg-white/10 h-10"
                        disabled={filteredRegistrations.length === 0}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Results count */}
            <div className="text-white/60 text-sm">
                Showing {filteredRegistrations.length} of {registrations.length} registrations
            </div>

            {/* Table */}
            {filteredRegistrations.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <p className="text-white/60 text-lg">
                        {searchQuery || statusFilter !== "all"
                            ? "No registrations match your search criteria"
                            : "No registrations yet"}
                    </p>
                    {searchQuery && (
                        <Button
                            onClick={() => setSearchQuery("")}
                            variant="ghost"
                            className="mt-4 text-white hover:bg-white/10"
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            ) : (
                <RegistrationTable
                    data={filteredRegistrations}
                />
            )}
        </div>
    )
}

export default RegistrationList