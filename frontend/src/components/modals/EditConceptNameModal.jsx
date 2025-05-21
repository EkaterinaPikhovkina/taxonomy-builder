import React, {useState} from 'react';
import CloseIcon from "../icons/CloseIcon.jsx";
import DefaultButton from "../buttons/DefaultButton.jsx";
import DefaultInput from "../inputs/DefaultInput.jsx";

function EditConceptNameModal({show, onClose, onSave, initialConceptName}) {
    const [conceptName, setConceptName] = useState(initialConceptName || "");

    if (!show) {
        return null;
    }

    return (
        <div className="modal-backdrop fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center">
            <div className="flex w-[500px] flex-col items-start bg-gray-100">

                <div className="flex px-8 py-4 justify-between items-center self-stretch bg-blue">
                    <p className="text-white text-lg font-semibold leading-normal">Редагування назви концепту</p>
                    <CloseIcon className="w-4 h-4" onClick={() => {
                        onClose();
                    }}/>
                </div>

                <div className="flex p-6 flex-col items-start gap-6 self-stretch">
                    <div className="flex p-6 flex-col items-start gap-2 self-stretch rounded-[12px] bg-white">
                        <div className="flex flex-col items-center gap-4 self-stretch">
                            <DefaultInput label="Нова назва"
                                          value={conceptName}
                                          onChange={(e) => setConceptName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="self-end">
                        <DefaultButton
                            onClick={() => {
                                onSave(conceptName);
                                onClose();
                            }}
                        >
                            Змінити
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditConceptNameModal;