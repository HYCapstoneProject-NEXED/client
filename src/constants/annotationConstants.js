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

// Standard defect type constants (for reference, actual values come from DB)
export const DEFECT_TYPES = {
  SCRATCH: 'Scratch',
  DENT: 'Dent',
  DISCOLORATION: 'Discoloration',
  CONTAMINATION: 'Contamination',
};

// DB에서 로드된 defect classes 저장용 변수
export let LOADED_DEFECT_CLASSES = [];

// DB에서 로드된 defect classes를 설정하는 함수
export const setLoadedDefectClasses = (defectClasses) => {
  LOADED_DEFECT_CLASSES = defectClasses;
};

// 이름으로 defect class를 가져오는 함수
export const getDefectClassByName = (name) => {
  return LOADED_DEFECT_CLASSES.find(dc => dc.class_name === name);
};

// Annotation status constants
export const ANNOTATION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
}; 