import { readdir, writeFile } from "fs";
import { join } from "path";
import { promisify } from "util";
import * as https from "https";

const indexFileName = "index";
const indexFileExt = ".ts";

export async function genIndex(dir: string) {
  // 得到目录下所有文件名集合
  const result = await promisify(readdir)(dir);

  // 过滤掉index.ts文件和index文件夹
  const moduleNames = result
    .map((n) => n.split(".")[0])
    .filter((m) => m !== indexFileName);

  // 生成聚合导出代码
  const content = moduleNames.map((n) => `export * from './${n}';`).join("\n");

  // 写入文件夹下
  await promisify(writeFile)(join(dir, indexFileName + indexFileExt), content);
}

export function httpReq() {
  https
    .get(
      "https://nextjsfirst-iqux2i3w7-fuyun791.vercel.app/api/hello",
      (res) => {
        console.log("statusCode:", res.statusCode);
        console.log("headers:", res.headers);

        console.log("res", res);

        res.on("data", (d: Buffer) => {
          console.log("ddd", d.toString(), d);
          process.stdout.write(d);
        });
      }
    )
    .on("error", (e) => {
      console.error(e);
    });
}
