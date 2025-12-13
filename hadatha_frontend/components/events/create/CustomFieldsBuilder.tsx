"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


type FormValues = {
    registrationFields: {
        label: string
        type: string
        options?: string
    }[]
}

export function CustomFieldsBuilder({ disabled }: { disabled?: boolean }) {
    const { control, register, watch } = useFormContext<FormValues>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "registrationFields",
    })
    console.log(fields)
    const watchFieldTypes = watch("registrationFields")

    return (
        <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">Registration Fields</CardTitle>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => append({ label: "", type: "text", options: "" })}
                    className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-12 cursor-pointer hover:text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => {
                    const currentType = watchFieldTypes?.[index]?.type

                    return (
                        <div key={field.id} className="flex flex-col gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-start gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label>Field Label</Label>
                                    <Input
                                        disabled={disabled}
                                        {...register(`registrationFields.${index}.label` as const)}
                                        placeholder="e.g., T-Shirt Size"
                                        className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12"
                                    />
                                </div>
                                <div className="w-1/3 space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        disabled={disabled}
                                        onValueChange={(value) => {
                                            const event = { target: { value, name: `registrationFields.${index}.type` } }
                                            register(`registrationFields.${index}.type`).onChange(event)
                                        }}
                                        defaultValue={field.type || "text"}
                                        {...register(`registrationFields.${index}.type` as const)}
                                    >
                                        <SelectTrigger className="w-full bg-black/20 border-white/10 text-white h-12!">
                                            <SelectValue placeholder="Select type" className="h-12" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black/90 border-white/10 text-white">
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="textarea">Text Area</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="select" disabled>Select</SelectItem>
                                            <SelectItem value="radio" disabled>Radio Group</SelectItem>
                                            <SelectItem value="checkbox" disabled>Checkbox Group</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={disabled}
                                    onClick={() => remove(index)}
                                    className="mt-8 text-white/60 hover:text-red-400 hover:bg-white/5"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Options input for Select, Radio, and Checkbox types */}
                            {(currentType === "select" || currentType === "radio" || currentType === "checkbox") && (
                                <div className="space-y-2">
                                    <Label>Options (comma separated)</Label>
                                    <Input
                                        disabled={disabled}
                                        {...register(`registrationFields.${index}.options` as const)}
                                        placeholder="e.g., Small, Medium, Large"
                                        className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
                {fields.length === 0 && (
                    <div className="text-center py-8 text-white/40 text-sm">
                        No custom registration fields added.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
