import React from 'react';

function EditorHeaderButton({ children, onClick, icon: Icon, iconClassName, ...props }) {
    return (
        <button
            onClick={onClick}
            {...props}
            className="text-white font-inter text-lg font-normal flex items-center cursor-pointer"
        >
            {Icon && <Icon className={`${iconClassName}`} />}
            {children}
        </button>
    );
}

export default EditorHeaderButton;