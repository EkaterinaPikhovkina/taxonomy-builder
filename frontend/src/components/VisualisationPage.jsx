import React, {useEffect, useState, useRef, useCallback} from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import BackButton from "./buttons/BackButton.jsx";

function transformDataForGraph(taxonomyTree) {
    if (!taxonomyTree || taxonomyTree.length === 0) {
        return {nodes: [], links: []};
    }

    const nodes = [];
    const links = [];
    const addedNodeIds = new Set();

    function processNode(nodeData, parentId) {
        if (!nodeData || !nodeData.key) return;

        if (!addedNodeIds.has(nodeData.key)) {
            nodes.push({
                id: nodeData.key,
                name: nodeData.title || nodeData.key.split(/[#/]/).pop() || nodeData.key,
                val: (nodeData.children && nodeData.children.length > 0) ? 8 : 4,
                labels: nodeData.labels,
                definitions: nodeData.definitions,
                group: parentId ? (parentId.split(/[#/]/).pop() || 'child') : 'root',
            });
            addedNodeIds.add(nodeData.key);
        }

        if (parentId) {
            links.push({
                source: parentId,
                target: nodeData.key,
            });
        }

        if (nodeData.children && nodeData.children.length > 0) {
            nodeData.children.forEach(child => processNode(child, nodeData.key));
        }
    }

    taxonomyTree.forEach(rootNode => processNode(rootNode, null));

    return {nodes, links};
}


function VisualisationPage({taxonomyData}) {
    const [graphData, setGraphData] = useState({nodes: [], links: []});
    const graphContainerRef = useRef(null);
    const fgRef = useRef();
    const [dimensions, setDimensions] = useState({width: 0, height: 0});

    useEffect(() => {
        if (taxonomyData) {
            const transformed = transformDataForGraph(taxonomyData);
            setGraphData(transformed);
        } else {
            setGraphData({nodes: [], links: []});
        }
    }, [taxonomyData]);

    useEffect(() => {
        const updateDimensions = () => {
            if (graphContainerRef.current) {
                setDimensions({
                    width: graphContainerRef.current.offsetWidth,
                    height: graphContainerRef.current.offsetHeight,
                });
            }
        };

        const timeoutId = setTimeout(updateDimensions, 0);
        window.addEventListener('resize', updateDimensions);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    const handleNodeHover = useCallback(node => {
        if (graphContainerRef.current) {
            graphContainerRef.current.style.cursor = node ? 'pointer' : null;
        }
    }, []);

    const handleNodeClick = useCallback(node => {
        // Example: Center on node and zoom
        if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(2.5, 1000);
        }
        console.log("Clicked node:", node);
    }, []);


    return (
        <div className="min-h-screen h-screen flex flex-col [background-image:linear-gradient(117deg,_#707E87_0%,_#939DA6_100%)] overflow-hidden">
            <div className="fixed top-8 left-18 z-50">
                <BackButton to="/editor"/>
            </div>
            <div
                ref={graphContainerRef}
                className="w-full flex-grow flex items-center justify-center"
            >
                {dimensions.width > 0 && dimensions.height > 0 && graphData.nodes.length > 0 ? (
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={graphData}
                        nodeId="id"
                        nodeLabel={node => {
                            const lines = [];
                            lines.push(`<strong>Name:</strong> ${node.name}`);
                            lines.push(`<strong>URI:</strong> ${node.id}`);

                            if (node.labels && node.labels.length > 0) {
                                const labelsString = node.labels.map(l => {
                                    let labelPart = l.value;
                                    if (l.lang) {
                                        labelPart += `@${l.lang}`;
                                    }
                                    return labelPart;
                                }).join('; ');
                                lines.push(`<strong>Labels:</strong> ${labelsString}`);
                            }

                            if (node.definitions && node.definitions.length > 0) {
                                const definitionsString = node.definitions.map(d => {
                                    let defPart = d.value;
                                    if (d.lang) {
                                        defPart += `@${d.lang}`;
                                    }
                                    return defPart;
                                }).join('; ');
                                lines.push(`<strong>Definitions:</strong> ${definitionsString}`);
                            }
                            return lines.join('<br />');
                        }}
                        nodeVal="val"
                        nodeAutoColorBy="group"
                        linkDirectionalArrowLength={3.5}
                        linkDirectionalArrowRelPos={1}
                        linkCurvature={0.1}
                        width={dimensions.width}
                        height={dimensions.height}
                        cooldownTicks={150}
                        onEngineStop={() => {
                            if (fgRef.current && graphData.nodes.length > 0) {
                                fgRef.current.zoomToFit(600, 50);
                            }
                        }}
                        onNodeHover={handleNodeHover}
                        onNodeClick={handleNodeClick}
                        nodeCanvasObjectMode={() => "after"}
                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const label = node.name;
                            const fontSize = 12 / globalScale;
                            if (fontSize > 3) {
                                ctx.font = `${Math.min(10, fontSize)}px Sans-Serif`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                                ctx.fillText(label, node.x, node.y + node.val + 3 / globalScale);
                            }
                        }}
                        enableZoomInteraction={true}
                        enablePanInteraction={true}
                    />
                ) : (
                    <p className="text-gray-700 font-inter text-lg not-italic font-light leading-normal">
                        {taxonomyData === null ? "Loading taxonomy data..." :
                            (taxonomyData && taxonomyData.length === 0 && graphData.nodes.length === 0) ? "The taxonomy is empty. Upload or create a taxonomy in the editor." :
                                (!taxonomyData && graphData.nodes.length === 0) ? "No data to visualize. Upload or create a taxonomy in the editor." :
                                    (graphData.nodes.length === 0 && taxonomyData) ? "Data processing for visualization..." :
                                        "No data for visualization."
                        }
                    </p>
                )}
            </div>
        </div>
    );
}

export default VisualisationPage;