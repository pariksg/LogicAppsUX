import type { ITemplatesRelease } from './templates';

export interface IBundleFeed {
  defaultVersionRange: string;
  bundleVersions: {
    [bundleVersion: string]: {
      templates: string;
    };
  };
  templates: {
    v1: {
      [templateVersion: string]: ITemplatesRelease;
    };
  };
}
