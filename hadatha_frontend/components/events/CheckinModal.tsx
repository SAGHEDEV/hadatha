"use client"

import ModalWrapper from "../miscellneous/ModalWrapper";
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from "../ui/button";


const CheckInModal = ({ open, setOpen, title }: { open: boolean, setOpen: (open: boolean) => void, title: string }) => {
    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <div className="w-full max-w-[500px] text-white p-4">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-2xl font-bold">Checking in for {title}</h2>
                    <p className="text-white/60 text-sm">
                        Kindly scan the Qr-code of provided by the event organizer to continue.
                    </p>
                </div>

                <div className="w-full h-[400px] border-white/20 rounded-xl overflow-hidden flex justify-center items-center">
                    <Scanner
                        onScan={(result) => console.log(result)}
                        constraints={{
                            facingMode: 'environment',
                            aspectRatio: 1,
                            width: { ideal: 1920 },
                            height: { ideal: 1080 },
                        }}
                    />
                </div>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full mt-4 text-white py-6! hover:bg-white/10 hover:text-white rounded-full cursor-pointer">
                    Close
                </Button>
            </div>
        </ModalWrapper>
    )
}

export default CheckInModal;