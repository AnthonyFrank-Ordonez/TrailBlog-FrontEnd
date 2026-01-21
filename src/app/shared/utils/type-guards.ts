import { CommentLoadingStrategy } from '@core/models/interface/comments';
import { MenuModalStrategy } from '@core/models/interface/modal';
import { ExploreMetadata, MetaData } from '@core/models/interface/page-result';
import { PostDeleteType, PostLoadingStrategy } from '@core/models/interface/posts';

const postDeleteTypeSet = new Set<string>(['home', 'saved', 'drafts', 'detail']);
const menuModalStrategySet = new Set<string>(['delete', 'archive', 'unsave', 'save']);
const commentLoadingStrategySet = new Set<string>(['profile-comments']);
const postCommentStrategySet = new Set<string>([
  'regular',
  'popular',
  'explore',
  'drafts',
  'archives',
  'profile-posts',
  'profile-saved',
  'profile-view-history',
]);

export function isPostDeleteType(activeTab: string | undefined): activeTab is PostDeleteType {
  return typeof activeTab === 'string' && postDeleteTypeSet.has(activeTab);
}

export function isMenuModalStrategy(action: string): action is MenuModalStrategy {
  return typeof action === 'string' && menuModalStrategySet.has(action);
}

export function isCommentLoadingStrategy(
  strategy: PostLoadingStrategy | CommentLoadingStrategy,
): strategy is CommentLoadingStrategy {
  return typeof strategy === 'string' && commentLoadingStrategySet.has(strategy);
}

export function isPostLoadingStrategy(
  strategy: PostLoadingStrategy | CommentLoadingStrategy,
): strategy is PostLoadingStrategy {
  return typeof strategy === 'string' && postCommentStrategySet.has(strategy);
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

export function toCommentLoadingStrategy(
  strategy: PostLoadingStrategy | CommentLoadingStrategy,
): CommentLoadingStrategy {
  if (!isCommentLoadingStrategy(strategy))
    throw new Error(`Invalid comment loading strategy: ${strategy}`);
  return strategy;
}

export function toPostLoadingStrategy(
  strategy: PostLoadingStrategy | CommentLoadingStrategy,
): PostLoadingStrategy {
  if (!isPostLoadingStrategy(strategy))
    throw new Error(`Invalid post loading strategy: ${strategy}`);
  return strategy;
}
