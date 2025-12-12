"use client"

import { useState } from "react"
import { Registration, RegistrationStatus } from "@/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Eye, CheckCircle, XCircle, Copy, Check } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

interface RegistrationTableProps {
    data: Registration[]
    registrationFields?: { name: string; type: string }[]
}

export function RegistrationTable({ data, registrationFields = [] }: RegistrationTableProps) {
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
    console.log(selectedRegistration?.registrationData)

    const getStatusBadge = (status: RegistrationStatus) => {
        const statusConfig = {
            registered: { label: "Registered", className: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
            "checked-in": { label: "Checked In", className: "bg-green-500/20 text-green-400 border-green-500/50" },
            cancelled: { label: "Cancelled", className: "bg-red-500/20 text-red-400 border-red-500/50" }
        }

        const config = statusConfig[status]
        return (
            <Badge className={`${config.className} border`}>
                {config.label}
            </Badge>
        )
    }

    const copyToClipboard = (text: string, address: string) => {
        navigator.clipboard.writeText(text)
        setCopiedAddress(address)
        setTimeout(() => setCopiedAddress(null), 2000)
    }

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <>
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/60">Attendee</TableHead>
                            <TableHead className="text-white/60">Address</TableHead>
                            <TableHead className="text-white/60">Registration Date</TableHead>
                            <TableHead className="text-white/60">Status</TableHead>
                            <TableHead className="text-white/60">Check-in Time</TableHead>
                            <TableHead className="text-white/60">NFT</TableHead>
                            <TableHead className="text-white/60 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((registration) => (
                            <TableRow key={registration.id} className="border-white/10 hover:bg-white/5">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {registration.user.avatarUrl ? (
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={registration.user.avatarUrl}
                                                    alt={registration.user.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm">
                                                {registration.user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white font-medium">{registration.user.name}</p>
                                            <p className="text-white/60 text-sm">{registration.user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {registration.address ? (
                                        <div className="flex items-center gap-2">
                                            <code className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">
                                                {formatAddress(registration.address)}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(registration.address!, registration.id)}
                                                className="text-white/60 hover:text-white transition-colors"
                                            >
                                                {copiedAddress === registration.id ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white/40 text-sm">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-white/80">{registration.registrationDate}</TableCell>
                                <TableCell>{getStatusBadge(registration.status)}</TableCell>
                                <TableCell className="text-white/80">
                                    {registration.checkInTime || (
                                        <span className="text-white/40">Not checked in</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {registration.nftMinted ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-green-400 text-sm">Minted</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-white/40" />
                                            <span className="text-white/40 text-sm">Not minted</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-white/60 hover:text-white hover:bg-white/10"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-black border-white/10 text-white" align="end">
                                            <DropdownMenuItem
                                                onClick={() => setSelectedRegistration(registration)}
                                                className="hover:bg-white/10 cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Details Dialog */}
            <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
                <DialogContent className="bg-black border-white/10 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Registration Details</DialogTitle>
                    </DialogHeader>
                    {selectedRegistration && (
                        <div className="space-y-6 mt-4">
                            {/* User Info */}
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                {selectedRegistration.user.avatarUrl ? (
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                        <Image
                                            src={selectedRegistration.user.avatarUrl}
                                            alt={selectedRegistration.user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white text-xl">
                                        {selectedRegistration.user.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white">{selectedRegistration.user.name}</h3>
                                    <p className="text-white/60">{selectedRegistration.user.email}</p>
                                    {selectedRegistration.address && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <code className="text-xs bg-white/10 px-2 py-1 rounded text-white/80 truncate max-w-[240px]">
                                                {selectedRegistration.address}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(selectedRegistration.address!, 'modal')}
                                                className="text-white/60 hover:text-white transition-colors"
                                            >
                                                {copiedAddress === 'modal' ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {getStatusBadge(selectedRegistration.status)}
                            </div>

                            {/* Registration Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-white/60 text-sm mb-1">Registration Date</p>
                                    <p className="text-white font-medium">{selectedRegistration.registrationDate}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-white/60 text-sm mb-1">Ticket Type</p>
                                    <p className="text-white font-medium">{selectedRegistration.ticketType}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-white/60 text-sm mb-1">Check-in Time</p>
                                    <p className="text-white font-medium">
                                        {selectedRegistration.checkInTime || (
                                            <span className="text-white/40">Not checked in</span>
                                        )}
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-white/60 text-sm mb-1">NFT Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {selectedRegistration.nftMinted ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                <span className="text-green-400 font-medium">Minted</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4 text-white/40" />
                                                <span className="text-white/40 font-medium">Not minted</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Custom Registration Fields */}
                            {selectedRegistration.registrationData && Object.keys(selectedRegistration.registrationData).length > 0 && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="text-white font-semibold mb-3">Registration Information</h4>
                                    <div className="space-y-3">
                                        {Object.entries(selectedRegistration.registrationData).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-start py-2 border-b border-white/10 last:border-0">
                                                <span className="text-white/60 text-sm">{key}</span>
                                                <span className="text-white font-medium text-right max-w-[60%]">{value || 'N/A'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}