import React, {useEffect, useMemo, useState} from 'react';
import TreeNode from './TreeNode';
import NewTopConceptModal from "../modals/NewTopConceptModal.jsx";
import {addTopConcept} from "../../services/api.js";
import ButtonWithIcon from "../buttons/ButtonWithIcon.jsx";
import AddIcon from "../icons/AddIcon.jsx";

const filterTree = (nodes, query) => {
    if (!query) {
        return nodes;
    }
    const lowerCaseQuery = query.toLowerCase();

    function filterNode(node) {
        const nodeMatches = node.title.toLowerCase().includes(lowerCaseQuery);

        const filteredChildren = (node.children || [])
            .map(filterNode)
            .filter(child => child !== null);

        if (nodeMatches || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
        }

        return null;
    }

    return nodes.map(filterNode).filter(node => node !== null);
};

const getAllKeys = (nodes) => {
    let keys = new Set();
    nodes.forEach(node => {
        keys.add(node.key);
        if (node.children && node.children.length > 0) {
            const childKeys = getAllKeys(node.children);
            childKeys.forEach(key => keys.add(key));
        }
    });
    return keys;
};

function TreeView({treeData, refreshTaxonomyTree, onSelect, loading, searchQuery}) {
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [selectedNodeKey, setSelectedNodeKey] = useState(null);
    const [showNewConceptModal, setShowNewConceptModal] = useState(false);

    const filteredData = useMemo(() => {
        console.log("Filtering tree with query:", searchQuery);
        return filterTree(treeData, searchQuery);
    }, [treeData, searchQuery]);

    useEffect(() => {
        if (searchQuery && filteredData.length > 0) {
            const allFilteredKeys = getAllKeys(filteredData);
            setExpandedNodes(allFilteredKeys);
        } else if (!searchQuery) { /* empty */ }
    }, [searchQuery, filteredData]);


    const toggleNode = (key) => {
        const newExpandedNodes = new Set(expandedNodes);
        if (newExpandedNodes.has(key)) {
            newExpandedNodes.delete(key);
        } else {
            newExpandedNodes.add(key);
        }
        setExpandedNodes(newExpandedNodes);
    };

    const handleSelect = (key, nodeData) => {
        setSelectedNodeKey(key);
        console.log("TreeView handleSelect:", nodeData.node.title, key);
        onSelect(nodeData.node);
    };

    const addTopLevelConcept = async (conceptData) => {
        try {
            await addTopConcept(conceptData.conceptName);
            refreshTaxonomyTree();
            console.log(`Top concept '${conceptData.conceptName}' successfully added`);
        } catch (error) {
            console.error("Error adding top concept:", error);
            alert("Error adding top concept. Check console.");
        } finally {
            setShowNewConceptModal(false);
        }
    };

    return (
        <div className="flex flex-col items-start w-180 rounded-md bg-[rgba(248,248,248,0.28)] pt-8 h-full overflow-hidden shadow-[0px_0px_19.3px_0px_rgba(0,0,0,0.11)]">
            {loading ? (
                <div className="px-6 pb-2 text-black font-inter text-sm not-italic font-light leading-normal">Loading...</div>
            ) : (!treeData || treeData.length === 0) ? (
                <div className="px-6 pb-2">
                    <p className="text-black font-inter text-sm not-italic font-light leading-normal">
                        The taxonomy is empty. Add a new class.
                    </p>
                </div>
            ) : (!filteredData || filteredData.length === 0) && searchQuery ? (
                <div className="px-10 pb-2 text-gray-600">
                    <p className="text-black font-inter text-sm not-italic font-light leading-normal">
                        Nothing found for the query "{searchQuery}".
                    </p>
                </div>
            ) : (
                <div className="w-full overflow-auto flex-grow">
                    <div className="flex flex-col pb-2 gap-2">
                        {filteredData.map((node) => (
                            <TreeNode
                                key={node.key}
                                node={node}
                                onSelect={handleSelect}
                                level={0}
                                expandedNodes={expandedNodes}
                                toggleNode={toggleNode}
                                selectedNodeKey={selectedNodeKey}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="sticky bottom-0 flex py-6 justify-center items-center self-stretch">
                <ButtonWithIcon
                    onClick={() => {
                        setShowNewConceptModal(true);
                    }}
                >
                    <AddIcon className="w-4 h-4 shrink-0"/>
                    New class
                </ButtonWithIcon>
            </div>

            <NewTopConceptModal
                show={showNewConceptModal}
                onClose={() => setShowNewConceptModal(false)}
                onCreate={(conceptData) => {
                    console.log("Creating top-level concept:", conceptData);
                    addTopLevelConcept(conceptData);
                }}
            />
        </div>
    );
}

export default TreeView;