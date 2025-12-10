import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import '../assets/TracklistRanking.css';

// Helper function to reorder tracks
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const getTrackName = (track) =>
    typeof track === "string" ? track : track.name;


export default function TracklistRanking({ tracks = [], onReorder, readOnly = false, initialOrder = [] }) {
    const [items, setItems] = useState(tracks);

    // Update items when tracks prop changes
    useEffect(() => {
        if (tracks.length > 0) {
            if (readOnly && initialOrder.length > 0) {
                // Sort tracks according to initialOrder (tracklist_rating)
                const orderedTracks = initialOrder;
                // Add any tracks not in initialOrder at the end
                const remainingTracks = tracks
                .filter(t => !initialOrder.includes(getTrackName(t)))
                .map(getTrackName);

                setItems([...orderedTracks, ...remainingTracks]);
            } else {
                setItems(tracks);
            }
        }
    }, [tracks, readOnly, initialOrder]);

    const onDragEnd = (result) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const reorderedItems = reorder(
            items,
            result.source.index,
            result.destination.index
        );

        setItems(reorderedItems);
        
        // Notify parent component of the new order
        if (onReorder) {
            onReorder(reorderedItems);
        }
    };

    if (!tracks || tracks.length === 0) {
        return (
            <div className="tracklist-ranking-container">
                <h3 className="tracklist-title">Tracklist Ranking</h3>
                <p className="tracklist-empty">No tracks available</p>
            </div>
        );
    }

    if (readOnly) {
        return (
            <div className="tracklist-ranking-container">
                <h3 className="tracklist-title">Tracklist Ranking</h3>
                <div className="tracklist-dropzone read-only">
                {items.map((track, index) => (
                    <div key={index} className="track-item read-only">
                        <div className="track-rank">{index + 1}</div>
                        <div className="track-info">
                            <div className="track-name">{getTrackName(track) || track}</div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        );
    }

    return (
        <div className="tracklist-ranking-container">
            <h3 className="tracklist-title">Rank Your Favorite Tracks</h3>
            <p className="tracklist-subtitle">Drag and drop to reorder</p>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`tracklist-dropzone ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        >
                            {items.map((track, index) => (
                                <Draggable 
                                    key={track.id} 
                                    draggableId={track.id} 
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`track-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                            style={provided.draggableProps.style}
                                        >
                                            <div className="track-rank">{index + 1}</div>
                                            <div className="track-info">
                                                <div className="track-name">{getTrackName(track)}</div>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
