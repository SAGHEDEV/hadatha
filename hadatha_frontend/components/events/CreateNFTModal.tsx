"use client"

import { useState, useEffect } from "react"
import ModalWrapper from "../miscellneous/ModalWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Sparkles, Loader2, Image as ImageIcon, ArrowLeft, RefreshCw, Check } from "lucide-react"
import Image from "next/image"
import { useUploadToWalrus } from "@/hooks/useUploadToWalrus"
import { useEmbossedImageGenerator } from "@/hooks/useEmbossedImageGenerator"
import StatusModal from "../miscellneous/StatusModal"
import { useSetupAttendanceNFT, useUpdateNFTCollection } from "@/hooks/sui/useSetupAttendanceNFT"

interface CreateNFTModalProps {
    isOpen: boolean
    setOpen: (val: boolean) => void
    eventId: string;
    eventTitle: string
    onSuccess: (imageUrl: string, name: string, description: string) => void
    section?: "create" | "edit" // "create" (default) or "edit" to update existing NFT details
    initialNFT?: { nftName?: string; nftDescription?: string; nftImageUrl?: string } // optional prefill for edit
}

type Step = 'select' | 'upload' | 'ai-preview' | 'details'

export function CreateNFTModal({ isOpen, setOpen, eventId, eventTitle, onSuccess, section = "create", initialNFT }: CreateNFTModalProps) {
    const [step, setStep] = useState<Step>('select')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const { setupNFT, isSettingUp } = useSetupAttendanceNFT()
    const { updateNFT, isUpdating } = useUpdateNFTCollection()

    const [name, setName] = useState(`${eventTitle} - Attendance NFT`)
    const [description, setDescription] = useState(`Official attendance NFT for ${eventTitle}`)

    // Status Modal State
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        description: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        description: ''
    })

    const { uploadToWalrus, isUploading } = useUploadToWalrus()
    const { generateImage, isGenerating } = useEmbossedImageGenerator()

    // Prefill when editing
    useEffect(() => {
        if (!isOpen) return
        
        if (section === "edit" && initialNFT) {
            if (initialNFT.nftName) setName(initialNFT.nftName)
            if (initialNFT.nftDescription) setDescription(initialNFT.nftDescription)
            if (initialNFT.nftImageUrl) {
                setImagePreview(initialNFT.nftImageUrl)
                setStep('details')
            }
        } else {
            // reset defaults on open for create
            setName(`${eventTitle} - Attendance NFT`)
            setDescription(`Official attendance NFT for ${eventTitle}`)
            if (!imageFile) setImagePreview(null)
            setStep('select')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, section, eventTitle])

    const reset = () => {
        setStep('select')
        setImageFile(null)
        setImagePreview(null)
        setName(`${eventTitle} - Attendance NFT`)
        setDescription(`Official attendance NFT for ${eventTitle}`)
    }

    const handleClose = () => {
        reset()
        setOpen(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
            setStep('details')
        }
    }

    const handleGenerateAI = async () => {
        const result = await generateImage(`${eventTitle} - Attendance NFT`, eventTitle)

        if (result) {
            setImagePreview(result.imageUrl)
            setImageFile(result.imageFile)
            setStep('ai-preview')
        } else {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Generation Failed',
                description: 'Failed to generate image. Please try again.'
            })
        }
    }

    const handleSubmit = async () => {
        // require at least an image URL or file
        if (!imageFile && !imagePreview) return

        try {
            // If a new file was selected, upload it. Otherwise use existing preview URL (edit case).
            const url = imageFile ? await uploadToWalrus(imageFile) : (imagePreview as string)
            
            // Call appropriate move call depending on section
            if (section === "edit") {
                await updateNFT({ eventId, nftName: name, nftDescription: description, nftImageUrl: url })
            } else {
                await setupNFT({ eventId: eventId, nftName: name, nftDescription: description, nftImageUrl: url })
            }

            onSuccess(url, name, description)
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: section === "edit" ? 'NFT Updated Successfully' : 'NFT Created Successfully',
                description: section === "edit"
                    ? 'NFT details updated and uploaded to Walrus.'
                    : 'Your attendee NFT has been created and uploaded to Walrus.'
            })
        } catch (error) {
            console.error("Upload failed", error)
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Upload Failed',
                description: 'Failed to upload image to Walrus. Please check your connection and try again.'
            })
        }
    }

    return (
        <>
            <ModalWrapper open={isOpen} setOpen={(val) => !val && handleClose()}>
                <div className="w-full min-w-[300px] md:w-[500px] max-w-[600px] text-white p-4">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">
                            {section === "edit" ? "Update Attendee NFT" : "Create Attendee NFT"}
                        </h2>
                    </div>

                    <div className="py-2">
                        {step === 'select' && (
                            <div className="w-full flex flex-col gap-6 items-center justify-center">
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setStep('upload')}
                                        className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all cursor-pointer group"
                                    >
                                        <div className="p-4 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 group-hover:text-blue-300 transition-colors">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <span className="font-semibold">Upload Image</span>
                                    </button>

                                    <button
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating}
                                        className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                                        ) : (
                                            <div className="p-4 rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 group-hover:text-purple-300 transition-colors">
                                                <Sparkles className="w-8 h-8" />
                                            </div>
                                        )}
                                        <span className="font-semibold">{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                                    </button>
                                </div>
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full mt-4 border border-white/20 text-white py-6 hover:bg-white/10 hover:text-white rounded-full cursor-pointer">
                                    Close
                                </Button>
                            </div>
                        )}

                        {step === 'upload' && (
                            <div className="w-full min-w-[300px] flex flex-col gap-4">
                                <div className="relative h-64 w-full rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-2 hover:border-white/40 transition-colors">
                                    <ImageIcon className="w-10 h-10 text-white/40" />
                                    <p className="text-white/60">Click to upload image</p>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <Button variant="ghost" onClick={() => setStep('select')} className="self-start gap-2 rounded-full py-4 px-6 cursor-pointer hover:bg-white/10">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </Button>
                            </div>
                        )}

                        {step === 'ai-preview' && imagePreview && (
                            <div className="flex flex-col gap-6">
                                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/20 bg-black/50">
                                    <Image src={imagePreview} alt="Generated Preview" fill className="object-contain" />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating}
                                        className="flex-1 rounded-full py-6 bg-transparent hover:bg-white/10 border border-white/20 text-white cursor-pointer hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                        Regenerate
                                    </Button>
                                    <Button
                                        onClick={() => setStep('details')}
                                        className="flex-1 rounded-full py-6 bg-white text-black hover:bg-gray-200 cursor-pointer font-medium"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Use Image
                                    </Button>
                                </div>
                                <Button variant="ghost" onClick={() => setStep('select')} className="self-center w-full border border-white/20 text-white py-6 hover:bg-white/10 hover:text-white rounded-full cursor-pointer">
                                    Cancel
                                </Button>
                            </div>
                        )}

                        {step === 'details' && (
                            <div className="flex flex-col gap-6">
                                <div className="flex gap-4 items-start">
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/20 shrink-0">
                                        {imagePreview && (
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="space-y-2">
                                            <Label>NFT Name</Label>
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="bg-white/5 border-white/10 min-h-[100px]"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setStep('select')} className="flex-1 rounded-full py-6 cursor-pointer hover:bg-white/10">
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isUploading || isSettingUp || isUpdating}
                                        className="flex-1 bg-white text-black hover:bg-gray-200 rounded-full py-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {(isUploading || isSettingUp || isUpdating) ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {isUploading ? "Uploading..." : section === "edit" ? "Updating..." : "Creating..."}
                                            </>
                                        ) : (
                                            section === "edit" ? "Update NFT" : "Create NFT"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </ModalWrapper>

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => {
                    setStatusModal(prev => ({ ...prev, isOpen: false }))
                    if (statusModal.type === 'success') {
                        handleClose()
                    } else {
                        setStep("select")
                        setOpen(true)
                    }
                }}
                type={statusModal.type}
                title={statusModal.title}
                description={statusModal.description}
            />
        </>
    )
}