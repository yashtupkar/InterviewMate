import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

/**
 * A Premium, Universal Popup component with smooth In/Out animations.
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Function to call when closing
 * @param {string|React.Node} title - Modal title
 * @param {string|React.Node} description - Modal subtitle/description
 * @param {React.Node} children - Main content
 * @param {React.Node} footer - Footer actions
 * @param {string} maxWidth - Tailwind max-width class (e.g., 'max-w-lg')
 * @param {boolean} showClose - Whether to show the X button
 * @param {string} className - Additional classes for the modal container
 */
const UniversalPopup = ({ 
    isOpen, 
    onClose, 
    title, 
    description, 
    children, 
    footer,
    maxWidth = 'max-w-md',
    showClose = true,
    padding = 'p-8',
    className = '',
    overlayClassName = ''
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, 300); // Should match CSS animation duration
            return () => clearTimeout(timer);
        }

        return () => {
        };
    }, [isOpen]);

    if (!shouldRender) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return createPortal(
        <div 
            className={`fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50  
                ${isClosing ? 'animate-overlay-out' : 'animate-overlay-in'} ${overlayClassName}`}
            onClick={handleOverlayClick}
        >
            <div 
                className={`relative w-full ${maxWidth} bg-zinc-900 border border-white/5 rounded-2xl  overflow-hidden
                    ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} ${className}`}
            >
                {/* Subtle Gradient Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#bef264]/40 to-transparent" />

                {showClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                )}

                <div className={padding}>
                    {(title || description) && (
                        <div className="mb-8">
                            {title && (
                                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="custom-scrollbar max-h-[70vh] overflow-y-auto">
                        {children}
                    </div>

                    {footer && (
                        <div className="mt-4 flex items-center justify-end gap-4">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UniversalPopup;
