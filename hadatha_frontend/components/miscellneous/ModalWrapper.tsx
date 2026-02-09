"use client"

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const ModalWrapper = ({ open, setOpen, children }: { open: boolean, setOpen: (open: boolean) => void, children: React.ReactNode }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeModal = () => setOpen(false);
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef, setOpen]);

    if (!open) return null;

    return createPortal(
        <div className="fixed w-screen h-screen top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 p-3">
            <div className="bg-black/50 backdrop-blur-sm fixed w-screen h-screen top-0 left-0 right-0 bottom-0 z-45">
            </div>
            <div ref={modalRef} className="modal-bg-glass-style p-4 z-50 my-3">
                {children}
            </div>
        </div>,
        document.body
    )
}

export default ModalWrapper