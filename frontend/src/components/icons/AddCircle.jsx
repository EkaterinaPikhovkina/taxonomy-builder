import React from 'react';

function AddCircle(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" {...props}>
            <g clip-path="url(#clip0_98_734)">
                <circle cx="8" cy="8.00049" r="7.5" stroke="black"/>
                <path
                    d="M12 8.57192H8.57143V12.0005H7.42857V8.57192H4V7.42906H7.42857V4.00049H8.57143V7.42906H12V8.57192Z"
                    fill="black"/>
            </g>
            <defs>
                <clipPath id="clip0_98_734">
                    <rect width="16" height="16" fill="white" transform="translate(0 0.000488281)"/>
                </clipPath>
            </defs>
        </svg>
    );
}

export default AddCircle;