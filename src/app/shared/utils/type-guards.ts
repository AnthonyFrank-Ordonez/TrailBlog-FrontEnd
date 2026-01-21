import { MenuModalStrategy } from '@core/models/interface/modal';
import { ExploreMetadata, MetaData } from '@core/models/interface/page-result';
import { PostDeleteType } from '@core/models/interface/posts';

const postDeleteTypeSet = new Set<string>(['home', 'saved', 'drafts', 'detail']);
const menuModalStrategySet = new Set<string>(['delete', 'archive', 'unsave', 'save']);

export function isPostDeleteType(activeTab: string | undefined): activeTab is PostDeleteType {
  return typeof activeTab === 'string' && postDeleteTypeSet.has(activeTab);
}

export function isMenuModalStrategy(action: string): action is MenuModalStrategy {
  return typeof action === 'string' && menuModalStrategySet.has(action);
}

export function isExploreMetadata(metadata: MetaData | undefined): metadata is ExploreMetadata {
  return (
    metadata !== undefined &&
    'allCommunitiesJoined' in metadata &&
    'code' in metadata &&
    'message' in metadata &&
    typeof metadata.allCommunitiesJoined === 'boolean' &&
    typeof metadata.code === 'string' &&
    typeof metadata.message === 'string'
  );
}

export function toPostDeleteType(activeTab: string | undefined): PostDeleteType | undefined {
  return isPostDeleteType(activeTab) ? activeTab : undefined;
}

export function toMenuModalStrategy(action: string): MenuModalStrategy {
  if (!isMenuModalStrategy(action)) throw new Error(`Invalid menu action: ${action}`);
  return action;
}
