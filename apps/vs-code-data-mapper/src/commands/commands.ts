/* eslint-disable no-param-reassign */
import DataMapperExt from '../DataMapperExt';
import { startBackendRuntime } from '../FxWorkflowRuntime';
import {
  dataMapDefinitionsPath,
  dataMapsPath,
  draftMapDefinitionSuffix,
  mapXsltExtension,
  schemasPath,
  supportedDataMapDefinitionFileExts,
} from '../extensionConfig';
import type { IActionContext } from '@microsoft/vscode-azext-utils';
import { callWithTelemetryAndErrorHandlingSync, callWithTelemetryAndErrorHandling, registerCommand } from '@microsoft/vscode-azext-utils';
import { existsSync as fileExistsSync, promises as fs } from 'fs';
import * as yaml from 'js-yaml';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { generateDataMapXslt, testDataMap } from 'libs/data-mapper/src/lib/core/queries/datamap';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { InitDataMapperApiService, defaultDataMapperApiServiceOptions } from 'libs/data-mapper/src/lib/core/services/dataMapperApiService';
import * as path from 'path';
import * as portfinder from 'portfinder';
import { Uri, window, workspace } from 'vscode';

export const registerCommands = () => {
  registerCommand('azureDataMapper.createNewDataMap', (context: IActionContext) => createNewDataMapCmd(context));
  registerCommand('azureDataMapper.loadDataMapFile', (context: IActionContext, uri: Uri) => loadDataMapFileCmd(context, uri));
  registerCommand('azureDataMapper.generateXslt', (context: IActionContext, uri: Uri) => generateXsltCmd(context, uri));
  registerCommand('azureDataMapper.testMap', (context: IActionContext, uri: Uri) => testMapCmd(context, uri));
};

const createNewDataMapCmd = (context: IActionContext) => {
  window.showInputBox({ prompt: 'Data Map name: ' }).then(async (newDataMapName) => {
    if (!newDataMapName) {
      context.telemetry.properties.result = 'Canceled';
      return;
    }

    context.telemetry.properties.result = 'Succeeded';

    DataMapperExt.openDataMapperPanel(newDataMapName);
  });
};

const loadDataMapFileCmd = async (context: IActionContext, uri: Uri) => {
  let mapDefinitionPath: string | undefined = uri?.fsPath;
  let draftFileIsFoundAndShouldBeUsed = false;

  // Handle if Uri isn't provided/defined (cmd pallette or btn)
  if (!mapDefinitionPath) {
    const fileUris = await window.showOpenDialog({
      title: 'Select a data map definition to load',
      defaultUri: Uri.file(path.join(DataMapperExt.getWorkspaceFolderFsPath(), dataMapDefinitionsPath)),
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      filters: { 'Data Map Definition': supportedDataMapDefinitionFileExts.map((ext) => ext.replace('.', '')) },
    });

    if (fileUris && fileUris.length > 0) {
      mapDefinitionPath = fileUris[0].fsPath;
    } else {
      context.telemetry.properties.result = 'Canceled';
      context.telemetry.properties.wasUsingFilePicker = 'true';
      return;
    }
  }

  // Check if there's a draft version of the map (more up-to-date version) definition first, and load that if so
  const mapDefinitionFileName = path.basename(mapDefinitionPath);
  const mapDefFileExt = path.extname(mapDefinitionFileName);
  const draftMapDefinitionPath = path.join(
    path.dirname(mapDefinitionPath),
    mapDefinitionFileName.replace(mapDefFileExt, `${draftMapDefinitionSuffix}${mapDefFileExt}`)
  );

  if (!mapDefinitionFileName.includes(draftMapDefinitionSuffix)) {
    // The file we're loading isn't a draft file itself, so now it makes sense to check for a draft version
    if (fileExistsSync(draftMapDefinitionPath)) {
      draftFileIsFoundAndShouldBeUsed = true;
    }
  }

  const mapDefinition = yaml.load(
    await fs.readFile(draftFileIsFoundAndShouldBeUsed ? draftMapDefinitionPath : mapDefinitionPath, 'utf-8')
  ) as {
    $sourceSchema: string;
    $targetSchema: string;
    [key: string]: any;
  };

  if (!mapDefinition.$sourceSchema || !mapDefinition.$targetSchema) {
    context.telemetry.properties.eventDescription = 'Attempted to load invalid map, missing schema definitions';
    DataMapperExt.showError('Invalid data map definition: $sourceSchema and $targetSchema must be defined.');
    return;
  }

  // Attempt to load schema files if specified
  const schemasFolder = path.join(DataMapperExt.getWorkspaceFolderFsPath(), schemasPath);
  const srcSchemaPath = path.join(schemasFolder, mapDefinition.$sourceSchema);
  const tgtSchemaPath = path.join(schemasFolder, mapDefinition.$targetSchema);

  const attemptToResolveMissingSchemaFile = async (schemaName: string, schemaPath: string): Promise<boolean> => {
    return !!(await callWithTelemetryAndErrorHandling(
      'azureDataMapper.attemptToResolveMissingSchemaFile',
      async (_context: IActionContext) => {
        const findSchemaFileButton = 'Find schema file';
        const clickedButton = await window.showErrorMessage(
          `Error loading map definition: ${schemaName} was not found in the Schemas folder!`,
          findSchemaFileButton
        );

        if (clickedButton && clickedButton === findSchemaFileButton) {
          const fileUris = await window.showOpenDialog({
            title: 'Select the missing schema file',
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            filters: { 'XML Schema': ['xsd'], 'JSON Schema': ['json'] },
          });

          if (fileUris && fileUris.length > 0) {
            // Copy the schema file they selected to the Schemas folder (can safely continue map definition loading)
            await fs.copyFile(fileUris[0].fsPath, schemaPath);
            context.telemetry.properties.result = 'Succeeded';

            return true;
          }
        }

        // If user doesn't select a file, or doesn't click the above action, just return (cancel loading the MapDef)
        context.telemetry.properties.result = 'Canceled';
        context.telemetry.properties.wasResolvingMissingSchemaFile = 'true';

        return false;
      }
    ));
  };

  // If schema file doesn't exist, prompt to find/select it
  if (!fileExistsSync(srcSchemaPath)) {
    const successfullyFoundAndCopiedSchemaFile = await attemptToResolveMissingSchemaFile(mapDefinition.$sourceSchema, srcSchemaPath);

    if (!successfullyFoundAndCopiedSchemaFile) {
      context.telemetry.properties.result = 'Canceled';
      context.telemetry.properties.missingSourceSchema = 'true';

      DataMapperExt.showError('No source schema file was selected. Aborting load...');
      return;
    }
  }

  if (!fileExistsSync(tgtSchemaPath)) {
    const successfullyFoundAndCopiedSchemaFile = await attemptToResolveMissingSchemaFile(mapDefinition.$targetSchema, tgtSchemaPath);

    if (!successfullyFoundAndCopiedSchemaFile) {
      context.telemetry.properties.result = 'Canceled';
      context.telemetry.properties.missingTargetSchema = 'true';

      DataMapperExt.showError('No target schema file was selected. Aborting load...');
      return;
    }
  }

  const dataMapName = path.basename(mapDefinitionPath, path.extname(mapDefinitionPath)).replace(draftMapDefinitionSuffix, ''); // Gets filename w/o ext (and w/o draft suffix)

  // Set map definition data to be loaded once webview sends webviewLoaded msg
  DataMapperExt.openDataMapperPanel(dataMapName, {
    mapDefinition,
    sourceSchemaFileName: path.basename(srcSchemaPath),
    targetSchemaFileName: path.basename(tgtSchemaPath),
  });
};

const generateXsltCmd = async (context: IActionContext, uri: Uri) => {
  let mapDefinitionPath: string | undefined = uri?.fsPath;

  // Handle if Uri isn't provided/defined (cmd pallette or btn)
  if (!mapDefinitionPath) {
    const fileUris = await window.showOpenDialog({
      title: 'Select a data map definition to generate xslt for',
      defaultUri: Uri.file(path.join(DataMapperExt.getWorkspaceFolderFsPath(), dataMapDefinitionsPath)),
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      filters: { 'Data Map Definition': supportedDataMapDefinitionFileExts.map((ext) => ext.replace('.', '')) },
    });

    if (fileUris && fileUris.length > 0) {
      mapDefinitionPath = fileUris[0].fsPath;
    } else {
      context.telemetry.properties.result = 'Canceled';
      context.telemetry.properties.wasUsingFilePicker = 'true';
      return;
    }
  }

  const mapDefinition = await fs.readFile(mapDefinitionPath, 'utf-8');

  const dataMapName = path.basename(mapDefinitionPath, path.extname(mapDefinitionPath)); // Gets filename w/o ext (and w/o draft suffix)

  const workflowFolder = DataMapperExt.getWorkspaceFolderFsPath();

  if (workflowFolder) {
    if (!DataMapperExt.backendRuntimePort) {
      DataMapperExt.backendRuntimePort = await portfinder.getPortPromise();
    }

    InitDataMapperApiService({ ...defaultDataMapperApiServiceOptions, port: DataMapperExt.backendRuntimePort.toString() });
    await startBackendRuntime(workflowFolder);
  }

  generateDataMapXslt(mapDefinition)
    .then((xsltStr) => {
      saveDataMap(dataMapName, xsltStr);
      window.showInformationMessage('XSLT generated and saved for map ' + dataMapName);
    })
    .catch((error) => {
      window.showErrorMessage('Generate XSLT command failed');

      const errMsg = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
      DataMapperExt.log(`Generate XSLT command failed: ${errMsg}`);
    });
};

const saveDataMap = (dataMapName: string, dataMapXslt: string) => {
  callWithTelemetryAndErrorHandlingSync('azureDataMapper.generateXsltCmd', (_context: IActionContext) => {
    const fileName = `${dataMapName}${mapXsltExtension}`;
    const dataMapFolderPath = path.join(DataMapperExt.getWorkspaceFolderFsPath(), dataMapsPath);
    const filePath = path.join(dataMapFolderPath, fileName);

    // Mkdir as extra insurance that directory exists so file can be written
    // - harmless if directory already exists
    fs.mkdir(dataMapFolderPath, { recursive: true })
      .then(() => fs.writeFile(filePath, dataMapXslt, 'utf8'))
      .catch(window.showErrorMessage);
  });
};

const testMapCmd = async (context: IActionContext, uri: Uri) => {
  let mapDefinitionPath: string | undefined = uri?.fsPath;

  // Handle if Uri isn't provided/defined (cmd pallette or btn)
  if (!mapDefinitionPath) {
    const fileUris = await window.showOpenDialog({
      title: 'Select a data map definition to test',
      defaultUri: Uri.file(path.join(DataMapperExt.getWorkspaceFolderFsPath(), dataMapDefinitionsPath)),
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      filters: { 'Data Map Definition': supportedDataMapDefinitionFileExts.map((ext) => ext.replace('.', '')) },
    });

    if (fileUris && fileUris.length > 0) {
      mapDefinitionPath = fileUris[0].fsPath;
    } else {
      context.telemetry.properties.result = 'Canceled';
      context.telemetry.properties.wasUsingFilePicker = 'true';
      return;
    }
  }

  const dataMapName = path.basename(mapDefinitionPath, path.extname(mapDefinitionPath)); // Gets filename w/o ext (and w/o draft suffix)

  const inputFileUris = await window.showOpenDialog({
    title: 'Select an input instance message file',
    defaultUri: Uri.file(path.join(DataMapperExt.getWorkspaceFolderFsPath(), 'Artifacts')),
    canSelectMany: false,
    canSelectFiles: true,
    canSelectFolders: false,
    filters: { 'Input files': ['xml', 'json'] },
  });

  let inputFilePath: string;

  if (inputFileUris && inputFileUris.length > 0) {
    inputFilePath = inputFileUris[0].fsPath;
  } else {
    context.telemetry.properties.result = 'Canceled';
    context.telemetry.properties.wasUsingFilePicker = 'true';
    return;
  }

  const inputContent = await fs.readFile(inputFilePath, 'utf-8');

  const outputFolderUris = await window.showOpenDialog({
    title: 'Select an ouput folder',
    defaultUri: Uri.file(path.join(DataMapperExt.getWorkspaceFolderFsPath(), 'Artifacts')),
    canSelectMany: false,
    canSelectFiles: false,
    canSelectFolders: true,
  });

  let outputFolder: string;

  if (outputFolderUris && outputFolderUris.length > 0) {
    outputFolder = outputFolderUris[0].fsPath;
  } else {
    context.telemetry.properties.result = 'Canceled';
    context.telemetry.properties.wasUsingFilePicker = 'true';
    return;
  }

  window.showInputBox({ prompt: 'Output file name: ' }).then(async (outputFileName) => {
    if (!outputFileName) {
      context.telemetry.properties.result = 'Canceled';
      return;
    }

    const workflowFolder = DataMapperExt.getWorkspaceFolderFsPath();

    if (workflowFolder) {
      if (!DataMapperExt.backendRuntimePort) {
        DataMapperExt.backendRuntimePort = await portfinder.getPortPromise();
      }

      InitDataMapperApiService({ ...defaultDataMapperApiServiceOptions, port: DataMapperExt.backendRuntimePort.toString() });
      await startBackendRuntime(workflowFolder);
    }

    testDataMap(dataMapName, inputContent)
      .then((outputContent) => saveTestMapOutput(outputFolder, outputFileName, outputContent.outputInstance?.$content))
      .catch((error) => {
        window.showErrorMessage('Test map command failed');

        const errMsg = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
        DataMapperExt.log(`Test map command failed: ${errMsg}`);
      });
  });
};

const saveTestMapOutput = (folderPath: string, fileName: string, outputContent: string | undefined) => {
  callWithTelemetryAndErrorHandlingSync('azureDataMapper.testMapCmd', (_context: IActionContext) => {
    const filePath = path.join(folderPath, fileName);

    // Mkdir as extra insurance that directory exists so file can be written
    // - harmless if directory already exists
    fs.mkdir(folderPath, { recursive: true })
      .then(() => fs.writeFile(filePath, outputContent ? outputContent : '', 'utf8'))
      .then(() => {
        const openPath = Uri.file(filePath);
        workspace.openTextDocument(openPath).then((doc) => {
          window.showTextDocument(doc);
        });
      })
      .catch(window.showErrorMessage);
  });
};
