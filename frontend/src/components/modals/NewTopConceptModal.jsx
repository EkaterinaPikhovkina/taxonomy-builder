import React, {useState} from 'react';
import CloseIcon from "../icons/CloseIcon.jsx";
import DefaultButton from "../buttons/DefaultButton.jsx";
import DefaultInput from "../inputs/DefaultInput.jsx";

function NewTopConceptModal({show, onClose, onCreate}) {
    const [conceptName, setConceptName] = useState('');

    if (!show) {
        return null;
    }

    const handleCreate = () => {
        if (!conceptName) {
            alert("Назва концепту є обов'язковою!");
            return;
        }

        const conceptData = {
            conceptName: conceptName
        };


        console.log("Data being sent to create concept:", conceptData);

        onCreate(conceptData);
        onClose();

        setConceptName('');
    };

    return (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center backdrop-blur-[64px]">
            <div
                className="flex w-[500px] py-1 rounded-md bg-[rgba(77,82,91,0.92)] flex-col items-start shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">

                <div className="flex px-8 py-6 justify-between items-center self-stretch">
                    <p className="text-white font-inter text-lg not-italic font-light leading-normal">New class</p>
                    <CloseIcon className="w-4 h-4" onClick={() => {
                        onClose();
                    }}/>
                </div>

                <div className="flex pt-4 pb-6 px-8 flex-col items-start gap-6 self-stretch">
                    <div className="flex flex-col items-center gap-4 self-stretch">
                        <DefaultInput label="Name" value={conceptName}
                                      onChange={(e) => setConceptName(e.target.value)}/>
                    </div>

                    <div className="self-end">
                        <DefaultButton
                            onClick={() => handleCreate()}
                        >
                            Create
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewTopConceptModal;