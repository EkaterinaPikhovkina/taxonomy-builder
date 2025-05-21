import React from 'react';
import DefaultButton from '../buttons/DefaultButton.jsx';
import CloseIcon from "../icons/CloseIcon.jsx";

function DeleteConceptModal({show, onClose, onDiscard}) {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center backdrop-blur-[64px]">
            <div className="flex w-[500px] py-1 rounded-md bg-[rgba(77,82,91,0.92)] flex-col items-start shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">

                <div className="flex px-8 py-6 justify-between items-center self-stretch">
                    <p className="text-white font-inter text-lg not-italic font-light leading-normal">Delete class?</p>
                    <CloseIcon className="w-4 h-4" onClick={onDiscard}/>
                </div>

                <div className="flex pt-4 pb-6 px-8 flex-col items-start gap-6 self-stretch">
                    <p className="text-white font-inter text-sm not-italic font-light leading-normal">When you delete a concept, all its descendants are deleted.</p>

                    <div className="self-end">
                        <DefaultButton onClick={onClose}>
                            Delete
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteConceptModal;