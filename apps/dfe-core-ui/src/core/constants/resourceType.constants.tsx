import {
  RESOURCE_TYPES,
  SCHEMA_FIELD_TYPES,
} from '@/core/components/CreateSchemaForm/fieldType.constants';
import { Tooltip } from '@/core/components/Tooltip';
import {
  IconArrowUpFromArc,
  IconLock,
  IconQuestionMark,
  IconSettingsBolt,
  IconUpload,
} from '@repo/dfe-icons';

export const fieldTypeIconSwitch = (field_type: string) => {
  switch (field_type) {
    case SCHEMA_FIELD_TYPES.BASE:
      return <IconLock />;
    case SCHEMA_FIELD_TYPES.PROMOTED:
      return <IconArrowUpFromArc className="rotate-180" />;
    case SCHEMA_FIELD_TYPES.ELASTIC_IMPORT:
    case SCHEMA_FIELD_TYPES.CSV_IMPORT:
      return <IconUpload />;
    case SCHEMA_FIELD_TYPES.USER_DEFINED:
      return <IconSettingsBolt />;
    default:
      return <IconQuestionMark />;
  }
};

const iconSwitch = (resource_type: string) => {
  switch (resource_type) {
    case RESOURCE_TYPES.CORE:
      return <IconLock />;
    case RESOURCE_TYPES.CUSTOM:
      return <IconSettingsBolt />;
  }
  return <IconQuestionMark />;
};
const resourceTypeTitle = (resource_type: string) => {
  switch (resource_type) {
    case RESOURCE_TYPES.CORE:
      return 'Core Resource';
    case RESOURCE_TYPES.CUSTOM:
      return 'Custom Resource';
  }
  return 'Unknown Resource';
};
export const resourceTypeIconSwitch = (resource_type: string) => {
  return (
    <Tooltip destroyOnHidden title={resourceTypeTitle(resource_type)}>
      {iconSwitch(resource_type)}
    </Tooltip>
  );
};
