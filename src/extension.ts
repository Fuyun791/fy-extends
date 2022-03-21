// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { genIndex, httpReq } from "./utils";
import { gitOp } from "./utils/gitOp";
import myRequest from "./utils/request";
import ReactPro from "./utils/reactPro";
import { checkPattern, handleI18 } from "./utils/getAllFill";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "hello" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "hello.helloWorld",
    (uri: vscode.Uri) => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from helloworld!");
      // httpReq();
      checkPattern("");
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return;
      }
      // console.log("activeEditor", activeEditor);
      // const dirPath = uri.fsPath;
      // genIndex(dirPath);
    }
  );

  const git = vscode.commands.registerCommand("fuyun.git", () => {
    vscode.window.showInformationMessage("Hello git!");
    // console.log("result", result);
    // gitOp();
  });

  const showLangByKey = vscode.commands.registerCommand(
    "fuyun.showLangByKey",
    () => {
      handleI18();
    }
  );

  const request2 = vscode.commands.registerCommand("fuyun.request", () => {
    vscode.window.showInformationMessage("Hello request!");
    myRequest.showSelect();
  });

  const reactPro = vscode.commands.registerCommand("fuyun.reactpro", () => {
    ReactPro.showMaterials(context);
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(git);
  context.subscriptions.push(request2);
  context.subscriptions.push(reactPro);
  context.subscriptions.push(showLangByKey);
}

// this method is called when your extension is deactivated
export function deactivate() {}
