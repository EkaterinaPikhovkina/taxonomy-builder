import React, {useState, useEffect} from 'react';
import EditCircle from "./icons/EditCircle.jsx";
import DeleteCircle from "./icons/DeleteCircle.jsx";
import {
    addSubConcept,
    deleteConcept,
    addConceptLabel,
    deleteConceptLabel,
    updateConceptLabel,
    addConceptDefinition,
    deleteConceptDefinition,
    updateConceptDefinition
} from '../services/api';
import DefaultButton from "./buttons/DefaultButton.jsx";
import NewSubConceptModal from "./modals/NewSubConceptModal.jsx";
import DeleteConceptModal from "./modals/DeleteConceptModal.jsx";
import DefaultLabel from "./labels/DefaultLabel.jsx";
import AddCircle from "./icons/AddCircle.jsx";
import DefaultInput from "./inputs/DefaultInput.jsx";


function LiteralForm({item, onSave, onCancel, itemType}) {
    const [value, setValue] = useState(item ? item.value : '');
    const [lang, setLang] = useState(item ? (item.lang || '') : '');

    useEffect(() => {
        setValue(item ? item.value : '');
        setLang(item ? (item.lang || '') : '');
    }, [item]);

    const handleSave = () => {
        if (!value.trim()) {
            alert(`${itemType} value cannot be empty.`);
            return;
        }
        onSave({value: value.trim(), lang: lang.trim() || null});
    };

    return (
        <div className="flex gap-2 p-2 rounded-md bg-[rgba(77,82,91,0.92)]">
            <DefaultInput value={lang}
                          label={"Lang (e.g., en, uk)"}
                          onChange={(e) => setLang(e.target.value)}
                          className="text-sm"/>
            <DefaultInput value={value}
                          label={`${itemType} value`}
                          onChange={(e) => setValue(e.target.value)}
                          className="text-sm"/>

            <div className="flex gap-2">
                <DefaultButton onClick={handleSave} className="text-sm">
                    Save
                </DefaultButton>
                <DefaultButton onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-sm">
                    Cancel
                </DefaultButton>
            </div>
        </div>
    );
}


function ConceptDetails({concept, refreshTaxonomyTree, setSelectedConcept}) {
    const [conceptName, setConceptName] = useState('');

    const [showNewSubclassModal, setShowNewSubclassModal] = useState(false);
    const [showDeleteConceptModal, setShowDeleteConceptModal] = useState(false);

    const [editingLabel, setEditingLabel] = useState(null);
    const [isAddingLabel, setIsAddingLabel] = useState(false);

    const [editingDefinition, setEditingDefinition] = useState(null);
    const [isAddingDefinition, setIsAddingDefinition] = useState(false);

    useEffect(() => {
        if (concept) {
            setConceptName(concept.title);
        } else {
            setConceptName('');
        }
        setEditingLabel(null);
        setIsAddingLabel(false);
        setEditingDefinition(null);
        setIsAddingDefinition(false);
    }, [concept]);

    const handleApiError = (action, error) => {
        console.error(`Error ${action}:`, error);
        alert(`Error ${action}. Check console.`);
    };

    const handleAddLabel = async (newLabelData) => {
        try {
            await addConceptLabel(concept.key, newLabelData.value, newLabelData.lang);
            refreshTaxonomyTree();
            setIsAddingLabel(false);
        } catch (error) {
            handleApiError("adding label", error);
        }
    };

    const handleDeleteLabel = async (labelToDelete) => {
        if (window.confirm(`Are you sure you want to delete label "${labelToDelete.value}"?`)) {
            try {
                await deleteConceptLabel(concept.key, labelToDelete.value, labelToDelete.lang);
                refreshTaxonomyTree();
            } catch (error) {
                handleApiError("deleting label", error);
            }
        }
    };

    const handleUpdateLabel = async (updatedLabelData) => {
        if (!editingLabel) return;
        try {
            await updateConceptLabel(concept.key, editingLabel.original, updatedLabelData);
            refreshTaxonomyTree();
            setEditingLabel(null);
        } catch (error) {
            handleApiError("updating label", error);
        }
    };

    const startEditLabel = (index, label) => {
        setEditingLabel({index, original: {...label}, current: {...label}});
        setIsAddingLabel(false);
    };

    const handleAddDefinition = async (newDefinitionData) => {
        try {
            await addConceptDefinition(concept.key, newDefinitionData.value, newDefinitionData.lang);
            refreshTaxonomyTree();
            setIsAddingDefinition(false);
        } catch (error) {
            handleApiError("adding definition", error);
        }
    };

    const handleDeleteDefinition = async (definitionToDelete) => {
        if (window.confirm(`Are you sure you want to delete definition "${definitionToDelete.value}"?`)) {
            try {
                await deleteConceptDefinition(concept.key, definitionToDelete.value, definitionToDelete.lang);
                refreshTaxonomyTree();
            } catch (error) {
                handleApiError("deleting definition", error);
            }
        }
    };

    const handleUpdateDefinition = async (updatedDefinitionData) => {
        if (!editingDefinition) return;
        try {
            await updateConceptDefinition(concept.key, editingDefinition.original, updatedDefinitionData);
            refreshTaxonomyTree();
            setEditingDefinition(null);
        } catch (error) {
            handleApiError("updating definition", error);
        }
    };

    const startEditDefinition = (index, definition) => {
        setEditingDefinition({index, original: {...definition}, current: {...definition}});
        setIsAddingDefinition(false); // Ensure add form is hidden
    };

    const handleCreateSubclass = async (conceptData) => {
        try {
            await addSubConcept(conceptData.conceptName, concept.key);
            refreshTaxonomyTree();
            console.log(`Subclass '${conceptData.conceptName}' successfully added to '${concept.title}'`);
        } catch (error) {
            console.error("Error adding subclass:", error);
            alert("Error adding subclass. Check console.");
        } finally {
            setShowNewSubclassModal(false);
        }
    };

    if (!concept) {
        return <div
            className="flex flex-col items-start rounded-md bg-[rgba(77,82,91,0.72)] gap-6 px-8 py-8 flex-1 h-full shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">
            <p className="text-white font-inter text-sm not-italic font-light leading-normal">
                Select a concept to display details.
            </p>
        </div>;
    }

    const handleDeleteConcept = async () => {
        try {
            await deleteConcept(concept.key);
            refreshTaxonomyTree();
            setSelectedConcept(null);
            console.log(`Концепт '${concept.title}' успішно видалено.`);
        } catch (error) {
            console.error("Помилка при видаленні концепту:", error);
            alert("Помилка при видаленні концепту. Перевірте консоль.");
        } finally {
            setShowDeleteConceptModal(false);
        }
    };


    return (
        <div
            className="flex flex-col items-start rounded-md bg-[rgba(77,82,91,0.72)] shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)] gap-6 px-8 py-8 flex-1 h-full overflow-auto">
            <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1 self-stretch">
                    <h2 className="text-white font-inter text-[32px] not-italic font-light leading-normal">
                        {conceptName}
                    </h2>
                    <p className="text-white font-inter text-sm not-italic font-light leading-normal">
                        {concept.key}
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4 self-stretch">
                <DefaultButton
                    onClick={() => {
                        setShowNewSubclassModal(true)
                    }}
                >
                    New subclass
                </DefaultButton>
                <DefaultButton
                    onClick={
                        () => setShowDeleteConceptModal(true)
                    }
                >
                    Delete class
                </DefaultButton>
            </div>

            <div className="flex p-4 flex-col items-start gap-4 self-stretch rounded-md bg-[rgba(248,248,248,0.2)] shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">
                <h3 className="text-white font-inter text-lg not-italic font-normal leading-normal">
                    Lexical Labels
                </h3>

                <div
                    className="flex px-3.5 py-2.5 flex-col items-start gap-2 self-stretch rounded-md bg-[rgba(248,248,248,0.2)] shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">
                    <p className="text-black font-inter text-base not-italic font-normal leading-normal">
                        Alternative Labels
                    </p>

                    <div className="flex flex-col items-start gap-1 self-stretch">
                        {concept.labels && Array.isArray(concept.labels) && concept.labels.length > 0 ? (
                            concept.labels.map((label, index) => (
                                <div key={`${concept.key}-label-${label.lang || 'none'}-${index}`}
                                     className="flex items-start gap-2 self-stretch py-1">
                                    {editingLabel && editingLabel.index === index ? (
                                        <LiteralForm
                                            item={editingLabel.current}
                                            onItemChange={(updated) => setEditingLabel({
                                                ...editingLabel,
                                                current: updated
                                            })}
                                            onSave={handleUpdateLabel}
                                            onCancel={() => setEditingLabel(null)}
                                            itemType="Label"
                                        />
                                    ) : (
                                        <div className="flex items-start gap-2 self-stretch">
                                            <div className="flex gap-1.5 pt-1 flex-shrink-0">
                                                <EditCircle className="w-5 h-5 shrink-0 cursor-pointer"
                                                            onClick={() => startEditLabel(index, label)}/>
                                                <DeleteCircle className="w-5 h-5 shrink-0 cursor-pointer"
                                                              onClick={() => handleDeleteLabel(label)}/>
                                            </div>
                                            <div className="flex gap-1 items-start">
                                                <p className="text-black font-inter text-sm not-italic font-light leading-normal">
                                                    <DefaultLabel
                                                        className="mr-0.5 shrink-0">{label.lang || '?'}</DefaultLabel> {label.value}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            ))
                        ) : (
                            <p className="text-gray-500 font-light text-base font-inter self-stretch py-1">
                                No labels
                            </p>
                        )}
                    </div>

                    {isAddingLabel && (
                        <LiteralForm
                            onSave={handleAddLabel}
                            onCancel={() => setIsAddingLabel(false)}
                            itemType="Label"
                        />
                    )}

                    <div className="flex items-center cursor-pointer" onClick={() => {
                        setIsAddingLabel(true);
                        setEditingLabel(null);
                    }}>
                        <AddCircle className="w-5 h-5 shrink-0"/>
                    </div>

                </div>
            </div>

            <div className="flex p-4 flex-col items-start gap-4 self-stretch rounded-md bg-[rgba(248,248,248,0.2)] shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">
                <h3 className="text-white font-inter text-lg not-italic font-normal leading-normal">
                    Documentation properties
                </h3>
                <div
                    className="flex px-3.5 py-2.5 flex-col items-start gap-2 self-stretch rounded-md bg-[rgba(248,248,248,0.2)] shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">
                    <p className="text-black font-inter text-base not-italic font-normal leading-normal">
                        Definitions
                    </p>

                    <div className="flex flex-col items-start gap-1 self-stretch">
                        {concept.definitions && Array.isArray(concept.definitions) && concept.definitions.length > 0 ? (
                            concept.definitions.map((def, index) => (
                                <div key={`${concept.key}-def-${def.lang || '?'}-${index}`}
                                     className="flex items-start gap-2 self-stretch py-1">
                                    {editingDefinition && editingDefinition.index === index ? (
                                        <LiteralForm
                                            item={editingDefinition.current}
                                            onItemChange={(updated) => setEditingDefinition({
                                                ...editingDefinition,
                                                current: updated
                                            })}
                                            onSave={handleUpdateDefinition}
                                            onCancel={() => setEditingDefinition(null)}
                                            itemType="Definition"
                                        />
                                    ) : (
                                        <div className="flex items-start gap-2 self-stretch">
                                            <div className="flex gap-1.5 pt-1 flex-shrink-0">
                                                <EditCircle className="w-5 h-5 shrink-0 cursor-pointer"
                                                            onClick={() => startEditDefinition(index, def)}/>
                                                <DeleteCircle className="w-5 h-5 shrink-0 cursor-pointer"
                                                              onClick={() => handleDeleteDefinition(def)}/>
                                            </div>
                                            <div className="flex gap-1 items-start">
                                                <p className="text-black font-inter text-sm not-italic font-light leading-normal">
                                                    <DefaultLabel
                                                        className="mr-0.5 shrink-0">{def.lang || '?'}</DefaultLabel> {def.value}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            ))
                        ) : (
                            <p className="text-gray-500 font-light text-base font-inter self-stretch py-1">
                                No definitions
                            </p>
                        )}
                    </div>
                    {isAddingDefinition && (
                        <LiteralForm
                            onSave={handleAddDefinition}
                            onCancel={() => setIsAddingDefinition(false)}
                            itemType="Definition"
                        />
                    )}

                    <div className="flex items-center cursor-pointer" onClick={() => {
                        setIsAddingDefinition(true);
                        setEditingDefinition(null);
                    }}>
                        <AddCircle className="w-5 h-5 shrink-0"/>
                    </div>

                </div>
            </div>
            <NewSubConceptModal
                show={showNewSubclassModal}
                parentConcept={concept}
                onClose={() => setShowNewSubclassModal(false)}
                onCreate={(conceptData) => {
                    handleCreateSubclass(conceptData);
                }}
            />
            <DeleteConceptModal
                show={showDeleteConceptModal}
                onClose={handleDeleteConcept}
                onDiscard={() => setShowDeleteConceptModal(false)}
            />
        </div>
    );
}

export default ConceptDetails;