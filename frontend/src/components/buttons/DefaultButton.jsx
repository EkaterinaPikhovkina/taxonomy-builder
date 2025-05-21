import React from 'react';

function DefaultButton({ children, onClick, disabled, className = "", ...props }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex px-7 py-3 justify-center items-center gap-4 rounded-md bg-[rgba(178,255,0,0.60)] shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)] text-[#060606] font-inter text-lg font-light leading-normal hover:bg-[rgba(178,255,0,0.80)] disabled:bg-[rgba(178,255,0,0.30)] cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default DefaultButton;