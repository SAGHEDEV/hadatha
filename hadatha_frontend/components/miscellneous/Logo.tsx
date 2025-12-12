import Link from "next/link"
import Image from "next/image"

const Logo = () => {
    return (
        <Link href="/">
            <Image src="/hadatha-logo-white.svg" alt="Hadatha Logo" width={50} height={10} className="h-12! w-auto z-10" />
        </Link>
    )
}

export default Logo
