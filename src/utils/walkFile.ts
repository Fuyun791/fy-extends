import { readFile } from "fs";
import { promisify } from "util";

import * as fsWalk from "@nodelib/fs.walk";
import { getRootPath } from "./common";

export const walkFile = async () => {
  const path = getRootPath()?.fsPath;
  console.log("path", path);
  if (!path) {
    return;
  }
  const entries = await new Promise<fsWalk.Entry[]>((resolve, reject) => {
    // 以递归的形式异步读取文件
    fsWalk.walk(
      path,
      {
        entryFilter: (entry) => {
          const isNotNodeModules = !entry.path.includes("node_modules");
          const isNotGit = !entry.path.includes(".git");
          const isNotMin = !/\.min\.js$/.test(entry.path);
          return (
            isNotNodeModules &&
            isNotGit &&
            isNotMin &&
            /\.ts$|\.tsx$|\.js$|\.jsx$|\.jsbundle$/.test(entry.name)
          );
        },
      },
      (error, entries) => {
        if (error) {
          reject(error);
        } else {
          resolve(entries);
        }
      }
    );
  });
  console.log("entries", entries);
  return Promise.all(
    entries.map((node) =>
      promisify(readFile)(node.path).then((res) => ({
        ...node,
        content: res.toString(),
      }))
    )
  );
};
