import React from 'react';

function HomePageHeader({ title }) {
    return (
        <div className="flex items-center px-18 py-8 self-stretch">
            {title && <h1 className="text-[#F8F8F8] font-inter text-[40px] font-light leading-normal">{title}</h1>}
        </div>
    );
}

export default HomePageHeader;