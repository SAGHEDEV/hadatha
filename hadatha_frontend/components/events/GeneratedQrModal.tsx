"use client"

import { useRef, useEffect } from "react";
import ModalWrapper from "../miscellneous/ModalWrapper";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import QRCodeStyling from "qr-code-styling";

const GeneratedQrModal = ({
    open,
    setOpen,
    title,
    eventId
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    title: string,
    eventId: string
}) => {
    const qrRef = useRef<HTMLDivElement>(null);
    const qrCode = useRef<QRCodeStyling | null>(null);

    useEffect(() => {
        // Initialize QR code instance only once
        if (!qrCode.current) {
            qrCode.current = new QRCodeStyling({
                width: 300,
                height: 300,
                data: eventId,
                margin: 10,
                qrOptions: {
                    typeNumber: 0,
                    mode: "Byte",
                    errorCorrectionLevel: "H"
                },
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 0
                },
                dotsOptions: {
                    type: "rounded",
                    color: "#ffffff"
                },
                backgroundOptions: {
                    color: "rgba(0, 0, 0, 0.8)"
                },
                cornersSquareOptions: {
                    type: "extra-rounded",
                    color: "#10b981"
                },
                cornersDotOptions: {
                    type: "dot",
                    color: "#10b981"
                }
            });
        }

        // Append QR code to DOM when modal opens
        if (open && qrRef.current && qrCode.current) {
            // Clear any existing content first
            qrRef.current.innerHTML = '';
            
            // Update data and append
            qrCode.current.update({ data: eventId });
            qrCode.current.append(qrRef.current);
        }
    }, [open, eventId]);

    const handleDownload = () => {
        if (qrCode.current) {
            qrCode.current.download({
                name: `${title.replace(/\s+/g, '-')}-checkin-qr`,
                extension: "png"
            });
        }
    };

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <div className="w-full max-w-[500px] text-white p-4">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-2xl font-bold">QR Code Check-in</h2>
                    <p className="text-white/60 text-sm">
                        Attendees can scan this QR code to check in for {title}
                    </p>
                </div>

                <div className="w-full bg-white/5 border border-white/20 rounded-xl p-8 flex justify-center items-center">
                    <div ref={qrRef} className="flex justify-center items-center" />
                </div>

                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/60 text-xs text-center">
                        Event ID: <code className="text-white/80 text-xs">{eventId.slice(0, 20)}...</code>
                    </p>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                    <Button
                        onClick={handleDownload}
                        className="w-full bg-green-700 hover:bg-green-600 text-white py-6 rounded-full cursor-pointer"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="w-full text-white py-6 hover:bg-white/10 hover:text-white rounded-full cursor-pointer"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default GeneratedQrModal;