"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

export default function Switch({
    className,
    checked,
    onCheckedChange,
    ...props
}: SwitchProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(e.target.checked)
    }

    return (
        <label className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-white/20 focus-within:ring-offset-2 focus-within:ring-offset-black",
            checked ? "bg-white" : "bg-white/10",
            className
        )}>
            <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={handleChange}
                {...props}
            />
            <span
                className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-black shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </label>
    )
}
