"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { Registration, RegistrationStatus } from "@/types"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface RegistrationTableProps {
    data: Registration[]
    onStatusChange: (id: string, status: RegistrationStatus) => void
    onDelete: (id: string) => void
}

export function RegistrationTable({ data, onStatusChange, onDelete }: RegistrationTableProps) {
    return (
        <div className="rounded-md border border-white/10 bg-white/5">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-white">Attendee</TableHead>
                        <TableHead className="text-white">Email</TableHead>
                        <TableHead className="text-white">Date</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-right text-white">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((registration) => (
                        <TableRow key={registration.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-medium text-white">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10">
                                        {registration.user.avatarUrl ? (
                                            <Image
                                                src={registration.user.avatarUrl}
                                                alt={registration.user.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                                                {registration.user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span>{registration.user.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-white/70">{registration.user.email}</TableCell>
                            <TableCell className="text-white/70">{registration.registrationDate}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        registration.status === 'checked-in' ? 'default' :
                                            registration.status === 'cancelled' ? 'destructive' : 'secondary'
                                    }
                                    className={
                                        registration.status === 'checked-in' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                                            registration.status === 'cancelled' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                                'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                    }
                                >
                                    {registration.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/10">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-black border-white/10 text-white">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onClick={() => navigator.clipboard.writeText(registration.user.email)}
                                            className="hover:bg-white/10 cursor-pointer"
                                        >
                                            Copy Email
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem
                                            onClick={() => onStatusChange(registration.id, 'checked-in')}
                                            className="hover:bg-white/10 cursor-pointer text-green-400"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Check In
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onStatusChange(registration.id, 'cancelled')}
                                            className="hover:bg-white/10 cursor-pointer text-orange-400"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancel Registration
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(registration.id)}
                                            className="hover:bg-white/10 cursor-pointer text-red-400"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
