"use client"

import ModalWrapper from "../miscellneous/ModalWrapper";
import { Button } from "../ui/button";
import { QrCode } from "lucide-react";


const GeneratedQrModal = ({ open, setOpen, title, eventId }: { open: boolean, setOpen: (open: boolean) => void, title: string, eventId: string }) => {
    console.log(eventId)
    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <div className="w-full max-w-[500px] text-white p-4">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-2xl font-bold">Qr code to check in for {title}</h2>
                    <p className="text-white/60 text-sm">
                        Kindly scan the Qr-code provided below to check in for this event!
                    </p>
                </div>

                <div className="w-full h-[300px] border-white/20 rounded-xl overflow-hidden flex justify-center items-center">
                    <QrCode
                        size={256}
                        style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                        values={eventId}
                    // viewBox={`0 0 256 256`}
                    />
                </div>
                <div>

                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full mt-4 text-white py-6! hover:bg-white/10 hover:text-white rounded-full cursor-pointer">
                        Close
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full mt-4 text-white bg-green-700 py-6! hover:bg-green-500 hover:text-white rounded-full cursor-pointer">
                        Downoad QR code
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    )
}

export default GeneratedQrModal;