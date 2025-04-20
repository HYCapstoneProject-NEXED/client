/**
 * Annotation related constants
 */

// Tool type constants
export const TOOL_TYPES = {
  HAND: 'hand',
  RECTANGLE: 'rectangle'
};

// Action type constants (for undo/redo functionality)
export const ACTION_TYPES = {
  ADD_BOX: 'add_box',
  MOVE_BOX: 'move_box',
  RESIZE_BOX: 'resize_box',
  CHANGE_CLASS: 'change_class',
  DELETE_BOX: 'delete_box',
};

// Defect type constants
export const DEFECT_TYPES = {
  DEFECT_A: 'Scratch',
  DEFECT_B: 'Dent',
  DEFECT_C: 'Discoloration',
  DEFECT_D: 'Contamination',
};

// Color class mapping for each defect type
export const DEFECT_COLOR_CLASSES = {
  [DEFECT_TYPES.DEFECT_A]: 'annotator-defect-a',
  [DEFECT_TYPES.DEFECT_B]: 'annotator-defect-b',
  [DEFECT_TYPES.DEFECT_C]: 'annotator-defect-c',
  [DEFECT_TYPES.DEFECT_D]: 'annotator-defect-d',
};

// Annotation status constants
export const ANNOTATION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
}; 