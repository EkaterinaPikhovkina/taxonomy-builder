import React from 'react';
import CloseIcon from "../icons/CloseIcon.jsx";
import DefaultButton from "../buttons/DefaultButton.jsx";

function ExportModal({show, onClose, onExport}) {
    if (!show) {
        return null;
    }

    const handleExport = (format) => {
        onExport(format);
        onClose();
    };

    return (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center backdrop-blur-[64px]">
            <div className="flex w-[500px] py-1 rounded-md bg-[rgba(77,82,91,0.92)] flex-col items-start shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">

                <div className="flex px-8 py-6 justify-between items-center self-stretch">
                    <p className="text-white font-inter text-lg not-italic font-light leading-normal">Export taxonomy</p>
                    <CloseIcon className="w-4 h-4" onClick={() => {
                        onClose();
                    }}/>
                </div>

                <div className="flex pt-4 pb-6 px-8 flex-col items-start gap-6 self-stretch">

                            <select
                                id="format"
                                name="format"
                                className="appearance-none flex py-3 px-4 items-center self-stretch bg-[rgba(248,248,248,0.44)] rounded-md shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)] cursor-pointer"
                                defaultValue="ttl"
                            >
                                <option className="text-[#060606] font-inter text-base not-italic font-light leading-normal" value="ttl">Turtle (.ttl)</option>
                            </select>


                    <div className="self-end">
                        <DefaultButton
                            onClick={() => handleExport(document.getElementById('format').value)}
                        >
                            Export
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </div>
    )
        ;
}

export default ExportModal;