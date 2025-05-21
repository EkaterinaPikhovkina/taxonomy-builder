import ConceptDetails from './ConceptDetails';
import TreeView from "./visualisation/TreeView.jsx";
import React, {useEffect, useState} from "react";
import {fetchTaxonomyTree, exportTaxonomy, clearRepository} from '../services/api';
import EditorHeader from "./headers/EditorHeader.jsx";
import {useNavigate} from 'react-router-dom';
import ExportModal from "./modals/ExportModal.jsx";
import CloseConfirmationModal from "./modals/CloseConfirmationModal.jsx";


const findConceptInTreeRecursively = (nodes, key) => {
    if (!nodes || !Array.isArray(nodes) || !key) return null;
    for (const node of nodes) {
        if (!node) continue;
        if (node.key === key) return node;
        if (node.children && Array.isArray(node.children)) {
            const found = findConceptInTreeRecursively(node.children, key);
            if (found) return found;
        }
    }
    return null;
};

function TaxonomyEditor({setTaxonomyData}) {
    const [selectedConcept, setSelectedConcept] = useState(null);
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTree, setRefreshTree] = useState(false);
    const navigate = useNavigate();

    const [showExportModal, setShowExportModal] = useState(false);
    const [showCloseConfirmationModal, setShowCloseConfirmationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const newTreeData = await fetchTaxonomyTree();

                if (newTreeData && newTreeData.length > 0) {
                    setTreeData(newTreeData);
                    setTaxonomyData(newTreeData);
                    if (selectedConcept && selectedConcept.key) {
                        const updatedSelectedConceptInstance = findConceptInTreeRecursively(newTreeData, selectedConcept.key);
                        setSelectedConcept(updatedSelectedConceptInstance);
                    } else { /* empty */ }
                } else {
                    setTreeData([]);
                    setTaxonomyData([]);
                    setSelectedConcept(null);
                }
            } catch (error) {
                console.error("Ошибка при загрузке таксономии:", error);
                setTreeData([]);
                setTaxonomyData([]);
                setSelectedConcept(null);
            } finally {
                setLoading(false);
                if (refreshTree) {
                    setRefreshTree(false);
                }
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTree, setTaxonomyData]);

    const handleConceptSelect = (concept) => {
        console.log("TaxonomyEditor handleConceptSelect:", concept.title, concept.key);
        setSelectedConcept(concept);
    };

    const handleExport = async (format) => {
        try {
            await exportTaxonomy(format);
        } catch (error) {
            console.error("Помилка при експорті таксономії:", error);
            alert("Помилка при експорті таксономії. Перевірте консоль.");
        }
    };

    const handleClose = async () => {
        try {
            await clearRepository();
            navigate('/');
        } catch (error) {
            console.error("Помилка при очищенні репозиторію:", error);
            alert("Помилка при очищенні репозиторію. Перевірте консоль.");
        }
    };

    const refreshTaxonomyTree = () => {
        setRefreshTree(true);
    };

    const handleSearchChange = (newValue) => {
        setSearchQuery(newValue);
    };


    return (
        <div className="h-screen flex flex-col [background-image:linear-gradient(117deg,_#707E87_0%,_#939DA6_100%)]">
            <EditorHeader
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onExport={() => setShowExportModal(true)}
                onClose={() => setShowCloseConfirmationModal(true)}
            />
            <div className="flex px-18 py-0 justify-center items-start gap-6 h-[calc(100%_-_112px)]">

                <TreeView
                    treeData={treeData}
                    refreshTaxonomyTree={refreshTaxonomyTree}
                    onSelect={handleConceptSelect}
                    loading={loading}
                    searchQuery={searchQuery}
                />

                <ConceptDetails
                    concept={selectedConcept}
                    refreshTaxonomyTree={refreshTaxonomyTree}
                    setSelectedConcept={setSelectedConcept}
                />

                <ExportModal
                    show={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    onExport={handleExport}
                />
                <CloseConfirmationModal
                    show={showCloseConfirmationModal}
                    onClose={handleClose}
                    onDiscard={() => setShowCloseConfirmationModal(false)}
                />
            </div>
        </div>
    );
}

export default TaxonomyEditor;