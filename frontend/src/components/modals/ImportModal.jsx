import React, {useState} from 'react';
import CloseIcon from "../icons/CloseIcon.jsx";
import DefaultButton from "../buttons/DefaultButton.jsx";
import {useNavigate} from 'react-router-dom';

function ImportModal({show, onClose, onImport, setTaxonomyData}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [fileNameText, setFileNameText] = useState("Select file");
    const navigate = useNavigate();

    if (!show) {
        return null;
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.name.endsWith('.ttl'))) {
            setSelectedFile(file);
            setError('');
            setFileNameText(file.name);
        } else {
            setSelectedFile(null);
            setError('Unsupported file format. Select .ttl.');
            setFileNameText("Select file");
        }
    };

    const handleImport = async () => {
        if (selectedFile) {
            try {
                await onImport(selectedFile, setTaxonomyData);
                navigate('/editor');
            } catch (error) {
                console.error("Помилка імпорту:", error);
                setError("Помилка імпорту таксономії.");
            }
        }
    };

    const resetFileNameText = () => {
        setFileNameText("Select file");
    }

    return (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center backdrop-blur-[64px]">
            <div
                className="flex w-[500px] py-1 rounded-md bg-[rgba(77,82,91,0.92)] flex-col items-start shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">
                <div className="flex px-8 py-6 justify-between items-center self-stretch">
                    <p className="text-white font-inter text-lg not-italic font-light leading-normal">Import taxonomy</p>
                    <CloseIcon className="w-4 h-4" onClick={() => {
                        onClose();
                        resetFileNameText();
                    }}/>
                </div>

                <div className="flex pt-4 pb-6 px-8 flex-col items-start gap-6 self-stretch">
                    <div
                        htmlFor="file-input"
                        className="file-input flex py-3 px-4 items-center self-stretch bg-[rgba(248,248,248,0.44)] rounded-md shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)] cursor-pointer"
                        onClick={() => document.getElementById('file-input').click()}
                    >
                            <span className="text-[#060606] font-inter text-base not-italic font-light leading-normal">
                                {fileNameText}
                            </span>
                        <input
                            id="file-input"
                            type="file"
                            onChange={handleFileChange}
                            accept=".ttl"
                            className="hidden"
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}

                    <div className="self-end">
                        <DefaultButton
                            onClick={handleImport}
                            disabled={!selectedFile}
                        >
                            Import
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportModal;