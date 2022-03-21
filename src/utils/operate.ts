import * as vscode from "vscode";
import { existsSync, readFile } from "fs";
import { promisify } from "util";
import { readTsExport } from "@saber2pr/ts-compiler";
import { getRootPath, safe_join } from "./common";
import { getI18nConfigSrcPath, i18nConfigSrcPath } from "./path";

const { window, workspace } = vscode;

const openFile = async (
  path: string,
  edit?: {
    offset: number;
    text: string;
  }
) => {
  const rootPath = getRootPath()?.fsPath;
  if (!rootPath) {
    return "";
  }
  const filePath = safe_join(rootPath, path);
  if (existsSync(filePath)) {
    try {
      const document = await workspace.openTextDocument(filePath);
      const editor = await window.showTextDocument(document);
      if (edit) {
        const { offset, text } = edit;
        await editor.edit((edit) => {
          // edit.replace();
          edit.insert(document.positionAt(offset), text);
        });
        // 选中生成的代码
        editor.selection = new vscode.Selection(
          document.positionAt(offset),
          document.positionAt(offset + text.length)
        );
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    vscode.window.showErrorMessage(`file not found ${path}`);
  }
};

const parseI18nLangEndPos = (i18nStr: string, lang: string) => {
  const result = i18nStr.match(new RegExp(`${lang}:[\\s\\S]*?{`));
  // const result = i18nStr.match(new RegExp(`${lang}:[\\s\\S]*?{[\\s\\S]*?}`));
  if (result) {
    const index = result.index as number;
    const offset = index + result[0].length;
    return offset;
  }
  return -1;
};

export const addI18nLang = async (lang: string, key: string, text: string) => {
  const i18nConfigPath = getI18nConfigSrcPath();
  if (existsSync(i18nConfigPath)) {
    const buf = await promisify(readFile)(i18nConfigPath);
    const code = buf.toString();
    if (code) {
      await openFile(i18nConfigSrcPath, {
        offset: parseI18nLangEndPos(code, lang),
        text: `\n    ${key}: '${text}',`,
      });
    }
  } else {
    vscode.window.showErrorMessage("i18n not found in src/i18n/strings.ts");
  }
};

const getKeys = (obj: any) => {
  if (obj) {
    return Object.keys(obj);
  }
  return [];
};

export const handleLangToMap = async () => {
  const i18nConfigPath = getI18nConfigSrcPath();
  console.log("i18nConfigPath", i18nConfigPath);
  // 下面这一步相当于有了数据， 还需要一个二级的展示
  if (existsSync(i18nConfigPath)) {
    const buf = await promisify(readFile)(i18nConfigPath);
    const code = buf.toString();
    if (code) {
      try {
        const result = await readTsExport(code);
        // console.log("arg 不用管 result", result);
        if ("en" in result) {
          return result;
        } else {
          const keys = getKeys(result);
          for (const key of keys) {
            if ("en" in result[key]) {
              return result[key];
            }
          }
        }
      } catch (error) {
        return String(error);
      }
    }
  } else {
    vscode.window.showErrorMessage(`i18n not found in ${i18nConfigPath}`);
    return;
  }
};
