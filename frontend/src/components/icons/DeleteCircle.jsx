import React from 'react';

function DeleteCircle(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 17" fill="none" {...props}>
            <g clip-path="url(#clip0_98_729)">
                <circle cx="8" cy="8.50049" r="7.5" stroke="black"/>
                <path
                    d="M4.8 12.5005L4 11.7005L7.2 8.50049L4 5.30049L4.8 4.50049L8 7.70049L11.2 4.50049L12 5.30049L8.8 8.50049L12 11.7005L11.2 12.5005L8 9.30049L4.8 12.5005Z"
                    fill="black"/>
            </g>
            <defs>
                <clipPath id="clip0_98_729">
                    <rect width="16" height="16" fill="white" transform="translate(0 0.500488)"/>
                </clipPath>
            </defs>
        </svg>
    );
}

export default DeleteCircle;