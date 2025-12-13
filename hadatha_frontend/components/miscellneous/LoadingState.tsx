import { motion, Variants } from "framer-motion";

const LoadingState = ({ loadingText }: { loadingText: string }) => {
    const letters = loadingText.split("");

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const item: Variants = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
            },
        },
        exit: {
            y: -20,
            opacity: 0,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <div className="flex items-center justify-center w-screen h-screen fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 backdrop-blur-sm">

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex space-x-1"
            >
                {letters.map((letter, index) => (
                    <motion.span
                        key={index}
                        variants={item}
                        className="text-2xl md:text-4xl font-bold text-white"
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                ))}
            </motion.div>
        </div>
    );
};

export default LoadingState;