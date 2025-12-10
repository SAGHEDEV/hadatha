const Footer = () => {
    return (
        <footer className="w-full py-8 mt-auto border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/40 text-sm">
                    © {new Date().getFullYear()} Hadatha. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms</a>
                    <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy</a>
                    <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Support</a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
