import { inputsResponse, outputsResponse } from '../__test__/__mocks__/monitoringInputsOutputsResponse';
import type { HttpRequestOptions, IHttpClient } from '../httpClient';
import type { IRunService } from '../run';
import type { CallbackInfo } from '../workflow';
import type { ArmResources, BoundParameters, ContentLink, LogicAppsV2, Run, Runs } from '@microsoft/utils-logic-apps';
import {
  isCallbackInfoWithRelativePath,
  ArgumentException,
  HTTP_METHODS,
  UnsupportedException,
  isString,
} from '@microsoft/utils-logic-apps';

export interface RunServiceOptions {
  apiVersion: string;
  baseUrl: string;
  httpClient: IHttpClient;
  accessToken?: string;
  workflowName: string;
  isDev?: boolean;
}

export class StandardRunService implements IRunService {
  _isDev = false;

  constructor(public readonly options: RunServiceOptions) {
    const { apiVersion, baseUrl, isDev } = options;
    if (!baseUrl) {
      throw new ArgumentException('baseUrl required');
    } else if (!apiVersion) {
      throw new ArgumentException('apiVersion required');
    }
    this._isDev = isDev || false;
  }

  async getContent(contentLink: ContentLink): Promise<any> {
    const { uri } = contentLink;
    const { httpClient } = this.options;

    if (!uri) {
      throw new Error();
    }

    try {
      const response = await httpClient.get<any>({
        uri,
        noAuth: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
      return response;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  private getAccessTokenHeaders = () => {
    const { accessToken } = this.options;
    if (!accessToken) {
      return undefined;
    }

    return new Headers({
      Authorization: accessToken,
    });
  };

  async getMoreRuns(continuationToken: string): Promise<Runs> {
    const headers = this.getAccessTokenHeaders();
    const { httpClient } = this.options;

    try {
      const response = await httpClient.get<ArmResources<Run>>({
        uri: continuationToken,
        headers: headers as Record<string, any>,
      });

      const { nextLink, value: runs }: ArmResources<Run> = response;
      return { nextLink, runs };
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Gets run details.
   * @param {string} runId - Run id.
   * @returns {Promise<Run>} Workflow runs.
   */
  async getRun(runId: string): Promise<Run> {
    const { apiVersion, baseUrl, httpClient, workflowName } = this.options;

    const uri = `${baseUrl}/workflows/${workflowName}/runs/${runId}?api-version=${apiVersion}&$expand=properties/actions,workflow/properties`;

    try {
      const response = await httpClient.get<Run>({
        uri,
      });
      return response;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Gets workflow run history
   * @returns {Promise<Runs>} Workflow runs.
   */
  async getRuns(): Promise<Runs> {
    const { apiVersion, baseUrl, workflowName, httpClient } = this.options;
    const headers = this.getAccessTokenHeaders();

    const uri = `${baseUrl}/workflows/${workflowName}/runs?api-version=${apiVersion}`;
    try {
      const response = await httpClient.get<ArmResources<Run>>({
        uri,
        headers: headers as Record<string, any>,
      });

      const { nextLink, value: runs }: ArmResources<Run> = response;
      return { nextLink, runs };
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Gets an array of scope repetition records for a node with the specified status.
   * @param {{ actionId: string, runId: string }} action - An object with nodeId and the runId of the workflow
   * @param {string} status - The status of scope repetition records to fetch
   * @return {Promise<RunScopeRepetition[]>}
   */
  async getScopeRepetitions(
    action: { nodeId: string; runId: string | undefined },
    status?: string
  ): Promise<{ value: Array<LogicAppsV2.RunRepetition> }> {
    const { nodeId, runId } = action;

    if (this._isDev) {
      return Promise.resolve({ value: [] });
    }

    const { apiVersion, baseUrl, httpClient } = this.options;
    const headers = this.getAccessTokenHeaders();

    const filter = status ? `&$filter=status eq '${status}'` : '';
    const uri = `${baseUrl}${runId}/actions/${nodeId}/scopeRepetitions?api-version=${apiVersion}${filter}`;

    try {
      const response = await httpClient.get<{ value: Array<LogicAppsV2.RunRepetition> }>({
        uri,
        headers: headers as Record<string, any>,
      });

      return response;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Gets the repetition record for the repetition item with the specified ID
   * @param {{ actionId: string, runId: string }} action - An object with nodeId and the runId of the workflow
   * @param {string} repetitionId - A string with the resource ID of a repetition record
   * @return {Promise<any>}
   */
  async getRepetition(action: { nodeId: string; runId: string | undefined }, repetitionId: string): Promise<LogicAppsV2.RunRepetition> {
    const { apiVersion, baseUrl, httpClient } = this.options;
    const { nodeId, runId } = action;
    const headers = this.getAccessTokenHeaders();

    const uri = `${baseUrl}${runId}/actions/${nodeId}/repetitions/${repetitionId}?api-version=${apiVersion}`;
    try {
      const response = await httpClient.get<LogicAppsV2.RunRepetition>({
        uri,
        headers: headers as Record<string, any>,
      });

      return response;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Triggers a workflow run
   * @param {CallbackInfo} callbackInfo - Information to call Api to trigger workflow.
   */
  async runTrigger(callbackInfo: CallbackInfo): Promise<void> {
    const { httpClient } = this.options;
    const method = isCallbackInfoWithRelativePath(callbackInfo) ? callbackInfo.method : HTTP_METHODS.POST;
    const uri = getCallbackUrl(callbackInfo);
    if (!uri) {
      throw new Error();
    }

    try {
      await this.getHttpRequestByMethod(httpClient, method, { uri });
    } catch (e: any) {
      throw new Error(`${e.status} ${e?.data?.error?.message}`);
    }
  }

  /**
   * Gets the inputs and outputs for an action repetition from a workflow run
   * @param {{inputsLink: ContentLink, outputsLink: ContentLink}} actionMetadata - Workflow file path.
   * @param {string} nodeId - Action ID.
   * @returns {Promise<any>} Action inputs and outputs.
   */
  async getActionLinks(actionMetadata: { inputsLink?: ContentLink; outputsLink?: ContentLink }, nodeId: string): Promise<any> {
    const { inputsLink, outputsLink } = actionMetadata ?? {};
    let inputs: Record<string, any> = {};
    let outputs: Record<string, any> = {};

    if (this._isDev) {
      inputs = inputsResponse[nodeId] ?? {};
      outputs = outputsResponse[nodeId] ?? {};
      return Promise.resolve({ inputs: this.parseActionLink(inputs, true), outputs: this.parseActionLink(outputs, false) });
    }

    if (outputsLink && outputsLink.uri) {
      outputs = await this.getContent(outputsLink);
    }
    if (inputsLink && inputsLink.uri) {
      inputs = await this.getContent(inputsLink);
    }
    return { inputs: this.parseActionLink(inputs, true), outputs: this.parseActionLink(outputs, false) };
  }

  /**
   * Parse inputs and outputs into dictionary.
   * @param {Record<string, any>} response - Api call raw response.
   * @param {boolean} isInput - Boolean to determine if it is an input/output response.
   * @returns {BoundParameters} List of parametes.
   */
  parseActionLink(response: Record<string, any>, isInput: boolean): BoundParameters {
    if (!response) {
      return response;
    }

    const dictionaryResponse = isString(response) ? { [isInput ? 'Inputs' : 'Outputs']: response } : response;

    return Object.keys(dictionaryResponse).reduce((prev, current) => {
      return { ...prev, [current]: { displayName: current, value: dictionaryResponse[current] } };
    }, {});
  }

  /**
   * Gets http request acording to method.
   * @param {IHttpClient} httpClient - HTTP Client.
   * @param {string} method - HTTP method.
   * @param {HttpRequestOptions<unknown>} options - Request options.
   * @returns {Promise<any>}
   */
  getHttpRequestByMethod(httpClient: IHttpClient, method: string, options: HttpRequestOptions<unknown>): Promise<any> {
    switch (method.toLowerCase()) {
      case 'get':
        return httpClient.get(options);
      case 'post':
        return httpClient.post(options);
      case 'put':
        return httpClient.put(options);
      default:
        throw new UnsupportedException(`Unsupported call connector method - '${method}'`);
    }
  }
}
function getCallbackUrl(_callbackInfo: CallbackInfo): any {
  throw new Error('Function not implemented.');
}
