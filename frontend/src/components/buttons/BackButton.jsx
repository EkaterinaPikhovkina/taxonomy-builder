import React from 'react';
import { Link } from 'react-router-dom';

const BackButton = ({ to }) => {
    return (
        <Link
            to={to}
            className="group relative w-20 h-20 flex items-center justify-center focus:outline-none"
            aria-label="Назад"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 104" fill="none">
                <g filter="url(#filter0_d_188_1104)">
                    <path
                        d="M84 52C84 69.6731 69.6731 84 52 84C34.3269 84 20 69.6731 20 52C20 34.3269 34.3269 20 52 20C69.6731 20 84 34.3269 84 52Z"
                        className="fill-[#F8F8F8] opacity-[0.55] hover:opacity-[0.90] transition-all duration-200 ease-in-out"/>
                    <path
                        d="M64 52.3077H44.4L52.8 60.7885L51.744 62L41.344 51.5L51.744 41L52.8 42.2115L44.4 50.6923H64V52.3077Z"
                        className="fill-black"/>
                </g>
                <defs>
                    <filter id="filter0_d_188_1104" x="0.700001" y="0.700001" width="102.6" height="102.6"
                            filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                       result="hardAlpha"/>
                        <feOffset/>
                        <feGaussianBlur stdDeviation="9.65"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_188_1104"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_188_1104" result="shape"/>
                    </filter>
                </defs>
            </svg>
        </Link>
    );
};

export default BackButton;