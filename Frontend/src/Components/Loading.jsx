import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Loading = ({ onComplete }) => {

    useEffect(() => {
        const completeTimer = setTimeout(() => onComplete(), 1300);

        return () => {
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const slideVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.5 },
    };

    return (
        <AnimatePresence>
            <motion.div
                key="loading" // Key is required for AnimatePresence
                className="relative z-10 flex justify-center items-center min-h-screen text-center"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition="transition"
            >
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-gray-200 text-lg font-bold tracking-widest"
                >
                    LOADING RHD.
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 0.5,
                            repeatType: "reverse",
                        }}
                    >
                        ..
                    </motion.span>
                </motion.p>
            </motion.div>
        </AnimatePresence>
    );
};

export default Loading;
