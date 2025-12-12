"use client"

import ModalWrapper from "./ModalWrapper"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

interface StatusModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'success' | 'error'
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

const StatusModal = ({ isOpen, onClose, type, title, description, actionLabel, onAction }: StatusModalProps) => {
    return (
        <ModalWrapper open={isOpen} setOpen={(val) => !val && onClose()}>
            <div className="w-full max-w-[400px] text-white p-6 flex flex-col items-center text-center gap-4">
                <div className={`p-4 rounded-full ${type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {type === 'success' ? (
                        <CheckCircle2 className="w-12 h-12" />
                    ) : (
                        <XCircle className="w-12 h-12" />
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex gap-3 w-full mt-4">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="flex-1 rounded-full py-6 cursor-pointer hover:bg-white/10 hover:text-white"
                    >
                        Close
                    </Button>
                    {actionLabel && onAction && (
                        <Button
                            onClick={onAction}
                            className={`flex-1 rounded-full py-6 cursor-pointer ${type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                        >
                            {actionLabel}
                        </Button>
                    )}
                </div>
            </div>
        </ModalWrapper>
    )
}

export default StatusModal
