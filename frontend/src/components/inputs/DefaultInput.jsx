import React from "react";

function DefaultInput({label, value, onChange, className = "", ...props}) {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={label}
            className={`flex py-3 px-4 items-center self-stretch bg-[rgba(248,248,248,0.44)] rounded-md shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)] cursor-pointer text-[#060606] font-inter text-base not-italic font-light leading-normal ${className}`}
            {...props}
        />
    )
}

export default DefaultInput;