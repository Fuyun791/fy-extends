import { existsSync } from "fs";
import { getRootPath, safe_join } from "./common";

export const i18nConfigSrcPath = "src/i18n/strings.ts";

export const getI18nConfigSrcPath = () => {
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
