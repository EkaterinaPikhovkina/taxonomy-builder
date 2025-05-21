import React from 'react';

function DefaultLabel({ children, className = "", ...props }) {
    return (
        <span
            className={`inline-flex px-2 py-0.5 justify-center items-center rounded-md bg-[rgba(178,255,0,0.80)] 
            text-[var(--black,#060606)] text-xs font-inter font-normal not-italic leading-[118%] cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}

export default DefaultLabel;