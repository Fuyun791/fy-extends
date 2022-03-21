import * as vscode from "vscode";
import { addI18nLang, handleLangToMap } from "./operate";

const translate = require("@vitalets/google-translate-api");

const { window } = vscode;

const map = {};

const getKeys = (obj: any) => {
  if (obj) {
    return Object.keys(obj);
  }
  return [];
};

const checkI18n = async () => {
  const options: vscode.InputBoxOptions = {
    prompt: "Label: ",
    placeHolder: "请输入多语言key",
  };
  // showOpenDialog
  const value = await window.showInputBox(options);

  if (!value) {
    throw new Error("请输入多语言key");
  }
  //
  const result = await handleLangToMap();

  const pickOptions: { code: string; label: string }[] = [];
  if (result) {
    for (const lang in result) {
      const langKeyMap = result[lang];
      if (langKeyMap.hasOwnProperty(value)) {
        console.log(lang, langKeyMap[value]);
        pickOptions.push({ code: "", label: `${lang}: ${langKeyMap[value]}` });
      }
    }
  }
  window.showQuickPick(pickOptions);
};

const addI18 = async () => {
  const options: vscode.InputBoxOptions = {
    prompt: "Label: ",
    placeHolder: "请输入多语言key和中文",
  };
  const value = await window.showInputBox(options);
  if (!value) {
    throw new Error("请输入多语言key");
  }
  try {
    const [key, text] = value.split(" ");
    addI18nLang("zh", key, text);
    const { text: enText } = await translate(text, { to: "en" });
    addI18nLang("en", key, enText);
    vscode.window.showInformationMessage("Success");
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
