import React from 'react';
import SearchInput from "../inputs/SearchInput.jsx";
import EditorHeaderButton from "../buttons/EditorHeaderButton.jsx";
import CloseIcon from "../icons/CloseIcon.jsx";
import ExportIcon from "../icons/ExportIcon.jsx";
import EyeIcon from "../icons/EyeIcon.jsx";
import { useNavigate } from 'react-router-dom';


function EditorHeader({searchQuery, onSearchChange, onExport, onClose}) {
    const navigate = useNavigate();

    return (
        <div
            className="flex items-center justify-between px-18 py-8 self-stretch">
            <SearchInput value={searchQuery} onChange={onSearchChange}/>
            <div className="flex items-center gap-8">

                <EditorHeaderButton
                    onClick={() => navigate('/visualisation')}
                    icon={EyeIcon}
                    iconClassName="w-9 h-8"
                    title="Візуалізація"
                >
                </EditorHeaderButton>

                <EditorHeaderButton
                    onClick={onExport}
                    icon={ExportIcon}
                    iconClassName="w-6 h-7"
                    title="Експорт"
                />

                <EditorHeaderButton
                    onClick={onClose}
                    icon={CloseIcon}
                    iconClassName="w-6 h-6"
                    title="Закрити"
                >
                </EditorHeaderButton>
            </div>
        </div>
    );
}

export default EditorHeader;