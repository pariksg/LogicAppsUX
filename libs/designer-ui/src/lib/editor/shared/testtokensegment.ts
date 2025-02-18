import type { OutputToken } from '../../tokenpicker';
import type { ValueSegment } from '../models/parameter';
import { TokenType, ValueSegmentType } from '../models/parameter';
import { guid } from '@microsoft/utils-logic-apps';

export const testTokenSegment: ValueSegment = {
  id: guid(),
  type: ValueSegmentType.TOKEN,
  token: {
    key: 'TokenKey',
    tokenType: TokenType.OUTPUTS,
    brandColor: '#007c89',
    description: 'triggerBody()',
    icon: 'data:image/svg+xml;base64,PHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogPHBhdGggZD0ibTAgMGgzMnYzMmgtMzJ6IiBmaWxsPSIjMDA5ZGE1Ii8+DQogPGcgZmlsbD0iI2ZmZiI+DQogIDxwYXRoIGQ9Im0xMy45IDIxLjE2NGg0LjIxOHYxLjg5MWgtNC4yMTh6Ii8+DQogIDxwYXRoIGQ9Im0xOC40MDkgMjEuNjczaDEuNTI3djEuMzgyaC0xLjUyN3oiLz4NCiAgPHBhdGggZD0ibTEyLjAwOSAyMS42NzNoMS41Mjd2MS4zODJoLTEuNTI3eiIvPg0KICA8cGF0aCBkPSJNMTUuMjgyIDIzLjQxOGgxLjM4MnYuNTgyaC0xLjM4MnoiLz4NCiAgPHBhdGggZD0iTTI0Ljg4MiAxOC4xMDlsLTEuNjczLTEuNTI3aC0xLjAxOGwxLjIzNiAxLjE2NGgtMy43MDl2LjhoMy43MDlsLTEuMTY0IDEuMjM2aC45NDV6Ii8+DQogIDxwYXRoIGQ9Ik0xNS4yODIgMjAuODczaDEuMzgydi0xLjAxOGMuOC0uMDczIDEuNTI3LS4zNjQgMi4yNTUtLjcyN3YtMS4zODJjLS40MzYuMzY0LTEuMDE4LjY1NS0xLjYuOC4zNjQtLjU4Mi42NTUtMS40NTUuOC0yLjQuODczLS4xNDUgMS43NDUtLjI5MSAyLjMyNy0uNTgyLS4yMTguNTgyLS41MDkgMS4wMTgtLjg3MyAxLjQ1NWgxLjQ1NWMuNTgyLS44NzMuODczLTEuOTY0Ljg3My0zLjEyNyAwLTEuMDkxLS4yOTEtMi4xMDktLjgtMi45ODItMS4wMTgtMS43NDUtMi45MDktMi45MDktNS4wOTEtMi45MDktMi4xODIgMC00LjA3MyAxLjE2NC01LjA5MSAyLjkwOS0uNTA5Ljg3My0uOCAxLjg5MS0uOCAyLjk4MiAwIDMuMDU1IDIuMzI3IDUuNTI3IDUuMjM2IDUuODkxdjEuMDkxem0yLjQ3My01LjE2NGMtLjUwOS4wNzMtMS4wOTEuMDczLTEuNzQ1LjA3My0uNjU1IDAtMS4yMzYgMC0xLjc0NS0uMDczLS4wNzMtLjU4Mi0uMTQ1LTEuMTY0LS4xNDUtMS43NDUgMC0uNDM2IDAtLjg3My4wNzMtMS4zMDkuNTgyLjA3MyAxLjE2NC4xNDUgMS44MTguMTQ1LjY1NSAwIDEuMjM2LS4wNzMgMS44MTgtLjE0NS4wNzMuNDM2LjA3My44LjA3MyAxLjMwOSAwIC42NTUtLjA3MyAxLjIzNi0uMTQ1IDEuNzQ1em0yLjYxOC0zLjc4MmMuMjkxLjU4Mi40MzYgMS4zMDkuNDM2IDIuMDM2bC0uMDczIDEuMDE4Yy0uNTA5LjI5MS0xLjMwOS41ODItMi40NzMuNzI3LjA3My0uNTA5LjA3My0xLjA5MS4wNzMtMS43NDUgMC0uNDM2IDAtLjk0NS0uMDczLTEuMzgyLjgtLjE0NSAxLjUyNy0uMzY0IDIuMTA5LS42NTV6bS0uMjE4LS4zNjRjLS40MzYuMjE4LTEuMDkxLjQzNi0xLjg5MS41ODItLjE0NS0xLjE2NC0uNDM2LTIuMTA5LS44NzMtMi43NjQgMS4xNjQuMzY0IDIuMTA5IDEuMDkxIDIuNzY0IDIuMTgyem0tNC4xNDUtMi40Yy4yMTggMCAuNDM2IDAgLjY1NS4wNzMuNDM2LjUwOS44NzMgMS42IDEuMDkxIDIuOTgyLS41MDkuMDczLTEuMDkxLjE0NS0xLjc0NS4xNDUtLjY1NSAwLTEuMjM2LS4wNzMtMS43NDUtLjE0NS4yMTgtMS4zODIuNTgyLTIuNDczIDEuMDkxLTIuOTgyLjE0NS0uMDczLjQzNi0uMDczLjY1NS0uMDczem0tMS4zODIuMjE4Yy0uMzY0LjY1NS0uNzI3IDEuNi0uODczIDIuNzY0LS44LS4xNDUtMS40NTUtLjM2NC0xLjg5MS0uNTgyLjU4Mi0xLjA5MSAxLjYtMS44MTggMi43NjQtMi4xODJ6bS0zLjQxOCA0LjU4MmMwLS43MjcuMTQ1LTEuMzgyLjQzNi0yLjAzNi41MDkuMjkxIDEuMjM2LjUwOSAyLjEwOS42NTUtLjA3My40MzYtLjA3My44NzMtLjA3MyAxLjM4MmwuMDczIDEuNzQ1Yy0xLjE2NC0uMTQ1LTEuOTY0LS40MzYtMi40NzMtLjcyN2wtLjA3My0xLjAxOHptLjI5MSAxLjZjLjU4Mi4yOTEgMS40NTUuNDM2IDIuMzI3LjU4Mi4xNDUuOTQ1LjQzNiAxLjgxOC44IDIuNC0xLjQ1NS0uNDM2LTIuNjE4LTEuNTI3LTMuMTI3LTIuOTgyem0yLjgzNi42NTVjLjU4Mi4wNzMgMS4wOTEuMDczIDEuNjczLjA3My41ODIgMCAxLjA5MSAwIDEuNjczLS4wNzMtLjIxOCAxLjE2NC0uNTgyIDIuMDM2LS45NDUgMi40NzNsLS42NTUuMDczYy0uMjE4IDAtLjQzNiAwLS42NTUtLjA3My0uNTA5LS41MDktLjg3My0xLjMwOS0xLjA5MS0yLjQ3M3oiLz4NCiA8L2c+DQo8L3N2Zz4NCg==',
    title: 'TEST_TOKEN',
    value: 'triggerBody()',
  },
  value: 'TEST_TOKEN',
};

export const outputToken: OutputToken = {
  key: 'test',
  brandColor: '#007c89',
  icon: 'data:image/svg+xml;base64,PHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogPHBhdGggZD0ibTAgMGgzMnYzMmgtMzJ6IiBmaWxsPSIjMDA5ZGE1Ii8+DQogPGcgZmlsbD0iI2ZmZiI+DQogIDxwYXRoIGQ9Im0xMy45IDIxLjE2NGg0LjIxOHYxLjg5MWgtNC4yMTh6Ii8+DQogIDxwYXRoIGQ9Im0xOC40MDkgMjEuNjczaDEuNTI3djEuMzgyaC0xLjUyN3oiLz4NCiAgPHBhdGggZD0ibTEyLjAwOSAyMS42NzNoMS41Mjd2MS4zODJoLTEuNTI3eiIvPg0KICA8cGF0aCBkPSJNMTUuMjgyIDIzLjQxOGgxLjM4MnYuNTgyaC0xLjM4MnoiLz4NCiAgPHBhdGggZD0iTTI0Ljg4MiAxOC4xMDlsLTEuNjczLTEuNTI3aC0xLjAxOGwxLjIzNiAxLjE2NGgtMy43MDl2LjhoMy43MDlsLTEuMTY0IDEuMjM2aC45NDV6Ii8+DQogIDxwYXRoIGQ9Ik0xNS4yODIgMjAuODczaDEuMzgydi0xLjAxOGMuOC0uMDczIDEuNTI3LS4zNjQgMi4yNTUtLjcyN3YtMS4zODJjLS40MzYuMzY0LTEuMDE4LjY1NS0xLjYuOC4zNjQtLjU4Mi42NTUtMS40NTUuOC0yLjQuODczLS4xNDUgMS43NDUtLjI5MSAyLjMyNy0uNTgyLS4yMTguNTgyLS41MDkgMS4wMTgtLjg3MyAxLjQ1NWgxLjQ1NWMuNTgyLS44NzMuODczLTEuOTY0Ljg3My0zLjEyNyAwLTEuMDkxLS4yOTEtMi4xMDktLjgtMi45ODItMS4wMTgtMS43NDUtMi45MDktMi45MDktNS4wOTEtMi45MDktMi4xODIgMC00LjA3MyAxLjE2NC01LjA5MSAyLjkwOS0uNTA5Ljg3My0uOCAxLjg5MS0uOCAyLjk4MiAwIDMuMDU1IDIuMzI3IDUuNTI3IDUuMjM2IDUuODkxdjEuMDkxem0yLjQ3My01LjE2NGMtLjUwOS4wNzMtMS4wOTEuMDczLTEuNzQ1LjA3My0uNjU1IDAtMS4yMzYgMC0xLjc0NS0uMDczLS4wNzMtLjU4Mi0uMTQ1LTEuMTY0LS4xNDUtMS43NDUgMC0uNDM2IDAtLjg3My4wNzMtMS4zMDkuNTgyLjA3MyAxLjE2NC4xNDUgMS44MTguMTQ1LjY1NSAwIDEuMjM2LS4wNzMgMS44MTgtLjE0NS4wNzMuNDM2LjA3My44LjA3MyAxLjMwOSAwIC42NTUtLjA3MyAxLjIzNi0uMTQ1IDEuNzQ1em0yLjYxOC0zLjc4MmMuMjkxLjU4Mi40MzYgMS4zMDkuNDM2IDIuMDM2bC0uMDczIDEuMDE4Yy0uNTA5LjI5MS0xLjMwOS41ODItMi40NzMuNzI3LjA3My0uNTA5LjA3My0xLjA5MS4wNzMtMS43NDUgMC0uNDM2IDAtLjk0NS0uMDczLTEuMzgyLjgtLjE0NSAxLjUyNy0uMzY0IDIuMTA5LS42NTV6bS0uMjE4LS4zNjRjLS40MzYuMjE4LTEuMDkxLjQzNi0xLjg5MS41ODItLjE0NS0xLjE2NC0uNDM2LTIuMTA5LS44NzMtMi43NjQgMS4xNjQuMzY0IDIuMTA5IDEuMDkxIDIuNzY0IDIuMTgyem0tNC4xNDUtMi40Yy4yMTggMCAuNDM2IDAgLjY1NS4wNzMuNDM2LjUwOS44NzMgMS42IDEuMDkxIDIuOTgyLS41MDkuMDczLTEuMDkxLjE0NS0xLjc0NS4xNDUtLjY1NSAwLTEuMjM2LS4wNzMtMS43NDUtLjE0NS4yMTgtMS4zODIuNTgyLTIuNDczIDEuMDkxLTIuOTgyLjE0NS0uMDczLjQzNi0uMDczLjY1NS0uMDczem0tMS4zODIuMjE4Yy0uMzY0LjY1NS0uNzI3IDEuNi0uODczIDIuNzY0LS44LS4xNDUtMS40NTUtLjM2NC0xLjg5MS0uNTgyLjU4Mi0xLjA5MSAxLjYtMS44MTggMi43NjQtMi4xODJ6bS0zLjQxOCA0LjU4MmMwLS43MjcuMTQ1LTEuMzgyLjQzNi0yLjAzNi41MDkuMjkxIDEuMjM2LjUwOSAyLjEwOS42NTUtLjA3My40MzYtLjA3My44NzMtLjA3MyAxLjM4MmwuMDczIDEuNzQ1Yy0xLjE2NC0uMTQ1LTEuOTY0LS40MzYtMi40NzMtLjcyN2wtLjA3My0xLjAxOHptLjI5MSAxLjZjLjU4Mi4yOTEgMS40NTUuNDM2IDIuMzI3LjU4Mi4xNDUuOTQ1LjQzNiAxLjgxOC44IDIuNC0xLjQ1NS0uNDM2LTIuNjE4LTEuNTI3LTMuMTI3LTIuOTgyem0yLjgzNi42NTVjLjU4Mi4wNzMgMS4wOTEuMDczIDEuNjczLjA3My41ODIgMCAxLjA5MSAwIDEuNjczLS4wNzMtLjIxOCAxLjE2NC0uNTgyIDIuMDM2LS45NDUgMi40NzNsLS42NTUuMDczYy0uMjE4IDAtLjQzNiAwLS42NTUtLjA3My0uNTA5LS41MDktLjg3My0xLjMwOS0xLjA5MS0yLjQ3M3oiLz4NCiA8L2c+DQo8L3N2Zz4NCg==',
  title: 'TEST_TOKEN',
  description: 'this is a description',
  value: 'triggerBody()',
  name: 'test',
  type: 'token',
  isAdvanced: false,
  outputInfo: {
    type: TokenType.OUTPUTS,
    required: false,
    format: undefined,
    source: 'body',
    isSecure: undefined,
    arrayDetails: undefined,
    actionName: undefined,
    functionName: undefined,
    functionArguments: undefined,
  },
};

export const outputToken2: OutputToken = {
  key: 'Outputs',
  brandColor: '#ba5d00',
  icon: 'https://logicappsv2resources.blob.core.windows.net/icons/javascript.svg',
  title: 'Outputs',
  description: "Outputs('Execute_JavaScript_Code')",
  name: 'outputs',
  type: 'token',
  isAdvanced: false,
  value: 'outputs()',
  outputInfo: {
    type: TokenType.OUTPUTS,
    required: false,
    format: undefined,
    source: 'Execute_JavaScript_Code',
    isSecure: undefined,
    arrayDetails: undefined,
    actionName: 'outputs',
    functionName: undefined,
    functionArguments: undefined,
  },
};
