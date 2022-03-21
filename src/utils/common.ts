import * as vscode from "vscode";
import { isAbsolute, join } from "path";
import { walkFile } from "./walkFile";

export const getRootPath = () => vscode.workspace.workspaceFolders?.[0]?.uri;

export const safe_join = (basePath: string, path: string) => {
  return isAbsolute(path) ? path : join(basePath, path);
};

export const checkPattern = async (pattern: string) => {
  const files = await walkFile();
  console.log("files", files);
  //   return files.map((node) => ({
  //     ...node,
  //     matchs: getMatchedFromContent(pattern, node.content),
  //   }));
};
