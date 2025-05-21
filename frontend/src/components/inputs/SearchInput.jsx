import React from 'react';
import { FaSearch } from 'react-icons/fa';
import ExportIcon from "../icons/ExportIcon.jsx";
import EditorHeaderButton from "../buttons/EditorHeaderButton.jsx";
import AddIcon from "../icons/AddIcon.jsx";
import SearchIcon from "../icons/SearchIcon.jsx";

function SearchInput({ value, onChange }) {
    return (
        <div className="flex items-center w-125 px-4 py-3 gap-4 rounded-md bg-gray-100">
            <SearchIcon className="w-4 h-4 shrink-0"/>
            <input
                type="text"
                placeholder="Search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-transparent text-[rgba(6,6,6,0.54)] placeholder-gray-500 font-inter text-base not-italic font-light leading-normal outline-none"
            />
        </div>
    );
}

export default SearchInput;