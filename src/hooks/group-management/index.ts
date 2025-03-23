
// Re-export all files from their sources
export * from './useAddGroup';
export * from './useDeleteGroup';
export * from './useDragAndDrop';
export * from './useGroupManagement';
export * from './useParticipantMovement';
export * from './useUpdateGroup';
export * from './useAssignGuide';
export * from './useGuideNameInfo';

// Explicitly re-export useGuideAssignmentForm with named exports
export { 
  useGuideAssignmentForm, 
  type FormValues,  
  type UseGuideAssignmentFormProps,
  type UseGuideAssignmentFormResult
} from './useGuideAssignmentForm';

export * from './types';

// Newly refactored hooks
export * from './useTourGroupState';
export * from './useParticipantRefresh';
export * from './useParticipantOperations';

// Explicitly re-export from utils to avoid ambiguity with similarly named functions
export { processGuideIdForAssignment } from './utils/guideAssignmentUtils';

// Re-export services
export * from './services/guideAssignmentService';
export * from './services/utils/validationService';
export * from './services/utils/namingService';
export * from './services/utils/optimisticUpdateService';
export * from './services/utils/persistenceUtils';
export * from './services/utils/notificationService';
export * from './services/utils/guideMappingService';
