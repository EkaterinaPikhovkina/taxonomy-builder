import React from 'react';

function HomePageButton({ children, onClick, ...props }) {
    return (
        <button onClick={onClick} {...props}
                className="flex w-[360px] px-10 py-7 justify-center items-center gap-2.5 rounded-xl bg-white/55 hover:bg-white/90 shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)] text-[#060606] font-inter text-xl font-light leading-normal cursor-pointer transition-colors duration-150 ease-in-out">
            {children}
        </button>
    );
}

export default HomePageButton;