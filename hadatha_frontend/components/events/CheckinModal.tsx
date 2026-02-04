"use client"

import { useState } from "react";
import ModalWrapper from "../miscellneous/ModalWrapper";
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from "../ui/button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence";
import { Loader2, CheckCircle, XCircle, Camera } from "lucide-react";
import { useCheckIn } from "@/hooks/sui/useCheckin";

type CheckInState = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

export const CheckInModal = ({
    open,
    setOpen,
    title
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    title: string
}) => {
    const { checkIn, isCheckingIn } = useCheckIn();
    const currentAccount = useCurrentAccount();
    const derivedAddress = useGetDerivedAddress(currentAccount?.address);

    const [checkInState, setCheckInState] = useState<CheckInState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [scannedEventId, setScannedEventId] = useState<string>("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleScan = async (result: any) => {
        // Prevent multiple scans
        if (checkInState === 'processing' || checkInState === 'success') {
            return;
        }

        const scannedData = result?.[0]?.rawValue || result;

        if (!scannedData) return;

        // Validate that it's an event ID (starts with 0x and has correct length)
        if (!scannedData.startsWith('0x') || scannedData.length < 60) {
            setCheckInState('error');
            setErrorMessage("Invalid QR code. Please scan a valid event check-in QR code.");
            setTimeout(() => {
                setCheckInState('idle');
                setErrorMessage("");
            }, 3000);
            return;
        }

        setScannedEventId(scannedData);
        setCheckInState('processing');

        if (!currentAccount?.address) {
            setCheckInState('error');
            setErrorMessage("Please connect your wallet first");
            setTimeout(() => {
                setCheckInState('idle');
                setErrorMessage("");
            }, 3000);
            return;
        }

        try {
            await checkIn({
                eventId: scannedData,
                attendeeAddress: currentAccount.address,
                accountId: derivedAddress || null,
            });

            setCheckInState('success');

            // Auto close after 2 seconds
            setTimeout(() => {
                setOpen(false);
                // Reset state when modal closes
                setTimeout(() => {
                    setCheckInState('idle');
                    setErrorMessage("");
                    setScannedEventId("");
                }, 300);
            }, 2000);
        } catch (error) {
            console.error("Check-in failed:", error);
            setCheckInState('error');

            let errorMsg = "Check-in failed. Please try again.";
            if (error instanceof Error) {
                if (error.message.includes('ENotRegistered')) {
                    errorMsg = "You are not registered for this event.";
                } else if (error.message.includes('EAlreadyCheckedIn')) {
                    errorMsg = "You have already checked in!";
                } else if (error.message.includes('ECheckinNotAllowed')) {
                    errorMsg = "Check-in is not available yet.";
                }
            }

            setErrorMessage(errorMsg);

            // Reset after 3 seconds
            setTimeout(() => {
                setCheckInState('idle');
                setErrorMessage("");
                setScannedEventId("");
            }, 3000);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleError = (error: any) => {
        console.error("QR Scanner error:", error);
        setCheckInState('error');
        setErrorMessage("Camera error. Please check permissions.");
        setTimeout(() => {
            setCheckInState('idle');
            setErrorMessage("");
        }, 3000);
    };

    const handleClose = () => {
        setOpen(false);
        // Reset state after modal closes
        setTimeout(() => {
            setCheckInState('idle');
            setErrorMessage("");
            setScannedEventId("");
        }, 300);
    };

    return (
        <ModalWrapper open={open} setOpen={handleClose}>
            <div className="w-full max-w-[500px] text-white p-4">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-2xl font-bold">Check-in for {title}</h2>
                    <p className="text-white/60 text-sm">
                        {checkInState === 'idle' && "Scan the QR code provided by the event organizer"}
                        {checkInState === 'scanning' && "Position the QR code within the frame"}
                        {checkInState === 'processing' && "Processing your check-in..."}
                        {checkInState === 'success' && "Successfully checked in!"}
                        {checkInState === 'error' && errorMessage}
                    </p>
                </div>

                <div className="w-full h-[400px] border-2 border-white/20 rounded-xl overflow-hidden flex justify-center items-center relative bg-black">
                    {checkInState === 'processing' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-16 h-16 animate-spin text-green-400" />
                            <p className="text-white font-medium">Checking you in...</p>
                        </div>
                    )}

                    {checkInState === 'success' && (
                        <div className="absolute inset-0 bg-green-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                            <CheckCircle className="w-16 h-16 text-green-400" />
                            <p className="text-white font-bold text-xl">Check-in Successful!</p>
                            <p className="text-white/80 text-sm">Welcome to the event</p>
                        </div>
                    )}

                    {checkInState === 'error' && (
                        <div className="absolute inset-0 bg-red-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 px-6">
                            <XCircle className="w-16 h-16 text-red-400" />
                            <p className="text-white font-bold text-xl">Check-in Failed</p>
                            <p className="text-white/80 text-sm text-center">{errorMessage}</p>
                        </div>
                    )}

                    {(checkInState === 'idle' || checkInState === 'scanning') && (
                        <>
                            <Scanner
                                onScan={handleScan}
                                onError={handleError}
                                constraints={{
                                    facingMode: 'environment',
                                    aspectRatio: 1,
                                }}
                                components={{
                                    onOff: false,
                                    torch: true,
                                    zoom: false,
                                    finder: true,
                                }}
                                styles={{
                                    container: {
                                        width: '100%',
                                        height: '100%',
                                    },
                                    video: {
                                        objectFit: 'cover',
                                    },
                                }}
                            />
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-green-400 rounded-2xl">
                                    {/* Corner decorations */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-white/60 text-sm">
                    <Camera className="w-4 h-4" />
                    <span>
                        {checkInState === 'idle' && "Position QR code in frame"}
                        {checkInState === 'scanning' && "Scanning..."}
                        {checkInState === 'processing' && "Processing..."}
                        {checkInState === 'success' && "Complete!"}
                        {checkInState === 'error' && "Try again"}
                    </span>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={checkInState === 'processing'}
                    className="w-full mt-4 text-white py-6 hover:bg-white/10 hover:text-white rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {checkInState === 'success' ? 'Done' : 'Close'}
                </Button>
            </div>
        </ModalWrapper>
    );
};

export default CheckInModal;