import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import Spinner from './Spinner';
import { AppContext } from '../../contexts/AppContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ isLoading = false, children, variant = 'primary', className = '', ...props }) => {
  const context = useContext(AppContext);
  const isReducedMotion = context?.isReducedMotion ?? false;

  const baseClasses = "px-6 py-3 font-bold text-lg uppercase tracking-wider focus:outline-none transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-lg";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg",
    secondary: "bg-white/10 text-gray-100 hover:bg-white/20 border border-white/20",
  };

  const motionProps = isReducedMotion ? {} : {
    whileHover: { scale: 1.05, boxShadow: `0 0 15px var(--glow-color)` },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  };

  return (
    <motion.button
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...motionProps}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner isButtonSpinner={true} />
          Processing...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};