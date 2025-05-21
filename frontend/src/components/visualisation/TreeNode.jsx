import React, {useState} from 'react';
import ArrowRight from "../icons/ArrowRight.jsx";
import ArrowDown from "../icons/ArrowDown.jsx";

function TreeNode({node, onSelect, level, expandedNodes, toggleNode, selectedNodeKey}) {
    const [isExpanded, setIsExpanded] = useState(expandedNodes.has(node.key));
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = node.key === selectedNodeKey;

    const handleToggle = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
        toggleNode(node.key);
    };

    const handleSelect = () => {
        onSelect(node.key, {node});
        console.log("TreeNode handleSelect:", node.title, node.key);
    };


    return (
        <div
            className={`tree-node level-${level} flex flex-col gap-2 px-10`}
        >
            <div className="flex items-center gap-4 cursor-pointer">
                {hasChildren && (
                    <span className="toggle-icon" onClick={handleToggle}>
                    {isExpanded ? <ArrowDown className="w-6 h-3"/> : <ArrowRight className="w-3 h-6"/>}
                </span>
                )}
                <span
                    className={`flex items-center px-4 py-1 rounded-md
                    ${isSelected
                        ? "bg-[rgba(178,255,0,0.80)]"
                        : isExpanded
                            ? "bg-gray-100"
                            : "bg-gray-100"
                    }`}
                    onClick={handleSelect}
                    title={node.key}
                >
                    {node.title}
                </span>
            </div>
            {isExpanded && hasChildren && (
                <div className="flex flex-col gap-2">
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.key}
                            node={child}
                            onSelect={onSelect}
                            level={level + 1}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                            selectedNodeKey={selectedNodeKey}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default TreeNode;