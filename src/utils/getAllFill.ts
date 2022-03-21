import * as vscode from "vscode";
import { existsSync, readFile } from "fs";
import { isAbsolute, join } from "path";
import { promisify } from "util";
import { readTsExport } from "@saber2pr/ts-compiler";
import * as https from "https";
import { walkFile } from "./walkFile";

const translate = require("@vitalets/google-translate-api");

const { window, workspace, env, Uri: URI } = vscode;

const i18nConfigSrcPath = "src/i18n/strings.ts";

const getRootPath = () => vscode.workspace.workspaceFolders?.[0]?.uri;

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
          edit.replace();
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

const safe_join = (basePath: string, path: string) => {
  return isAbsolute(path) ? path : join(basePath, path);
};

const getKeys = (obj: any) => {
  if (obj) {
    return Object.keys(obj);
  }
  return [];
};

const getI18nConfigSrcPath = () => {
  const rootPath = getRootPath()?.fsPath;
  if (rootPath) {
    const i18nConfigPath = safe_join(rootPath, i18nConfigSrcPath);
    if (existsSync(i18nConfigPath)) {
      return i18nConfigPath;
    }
    const i18nConfigJsPath = i18nConfigPath.replace(/\.ts$/, ".js");
    if (existsSync(i18nConfigJsPath)) {
      return i18nConfigJsPath;
    }
    return i18nConfigPath;
  }
  return "";
};

export const checkI18n = async () => {
  const options: vscode.InputBoxOptions = {
    prompt: "Label: ",
    placeHolder: "请输入多语言key",
  };
  // showOpenDialog
  const value = await window.showInputBox(options);
  if (!value) {
    throw new Error("请输入多语言key");
  }
  const i18nConfigPath = getI18nConfigSrcPath();
  console.log("i18nConfigPath", i18nConfigPath);
  // 下面这一步相当于有了数据， 还需要一个二级的展示
  let i18Result = undefined;
  if (existsSync(i18nConfigPath)) {
    const buf = await promisify(readFile)(i18nConfigPath);
    const code = buf.toString();
    if (code) {
      try {
        const result = await readTsExport(code);
        // console.log("arg 不用管 result", result);
        if ("en" in result) {
          i18Result = result;
        } else {
          const keys = getKeys(result);
          for (const key of keys) {
            if ("en" in result[key]) {
              i18Result = result[key];
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
  const pickOptions: { code: string; label: string }[] = [];
  if (i18Result) {
    const langs = getKeys(i18Result);
    console.log("value", value, "i18Result", i18Result, "langs", langs);
    for (const lang in i18Result) {
      const langKeyMap = i18Result[lang];
      if (langKeyMap.hasOwnProperty(value)) {
        console.log(lang, langKeyMap[value]);
        pickOptions.push({ code: "", label: `${lang}: ${langKeyMap[value]}` });
      }
    }
  }
  window.showQuickPick(pickOptions);
};

export const checkPattern = async (pattern: string) => {
  const files = await walkFile();
  console.log("files", files);
  //   return files.map((node) => ({
  //     ...node,
  //     matchs: getMatchedFromContent(pattern, node.content),
  //   }));
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

const addI18 = async () => {
  const options: vscode.InputBoxOptions = {
    prompt: "Label: ",
    placeHolder: "请输入多语言key和中文",
  };
  // showOpenDialog
  const value = await window.showInputBox(options);
  if (!value) {
    throw new Error("请输入多语言key");
  }
  try {
    const [key, text] = value.split(" ");
    addI18nLang("zh", key, text);
    const { text: enText } = await translate(text, { to: "en" });
    addI18nLang("en", key, enText);
    vscode.window.showErrorMessage("Success");
  } catch (error) {
    vscode.window.showErrorMessage("Error");
  }
};

const updateI18n = async () => {
  const options: vscode.InputBoxOptions = {
    prompt: "Label: ",
    placeHolder: "请输入多语言key和语言类型",
  };
  const value = await window.showInputBox(options);
  if (!value) {
    throw new Error("请输入多语言key");
  }
  // const result = "".match(new RegExp(`${"abc"}:[\\s\\S]*?,`, "g"));
};

export const handleI18 = async () => {
  const pickOptions = [
    { code: "find", label: "根据key查找多语言" },
    { code: "add", label: "根据key和中文添加多语言" },
    { code: "update", label: "根据key和语言类型更新" },
  ];
  const action = await vscode.window.showQuickPick(pickOptions);
  if (typeof action === "object" && action !== undefined) {
    switch (action.code) {
      case "find":
        checkI18n();
        break;
      case "add":
        addI18();
        break;
      case "update":
        updateI18n();
        break;
      default:
        break;
    }
  }
};
