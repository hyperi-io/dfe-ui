import {
  IconArrowUpFromArc,
  IconLock,
  IconQuestionMark,
  IconSettingsBolt,
  IconUpload,
} from '@repo/dfe-icons';

export const fieldTypeIconSwitch = (field_type: string) => {
  switch (field_type) {
    case 'base':
      return <IconLock />;
    case 'promoted':
      return <IconArrowUpFromArc />;
    case 'imported':
      return <IconUpload />;
    case 'user_defined':
      return <IconSettingsBolt />;
    default:
      return <IconQuestionMark />;
  }
};

export const resourceTypeIconSwitch = (resource_type: string) => {
  switch (resource_type) {
    case 'core':
      return <IconLock />;
    case 'custom':
      return <IconSettingsBolt />;
    default:
      return <IconQuestionMark />;
  }
};
