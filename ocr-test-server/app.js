const express = require("express");
const multiparty = require("multiparty");
const request = require("request");
const path = require("path");
const fs = require("fs");
const app = express();

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With, yourHeaderFeild"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use("/", (req, res) => {
  if (req.url === "/upload" && req.method === "POST") {
    let form = new multiparty.Form();
    // form.keepExtensions = true;
    form.uploadDir = "./imgs";
    form.parse(req, (err, fields, files) => {
      let oldPath = files.file[0].path;
      fs.renameSync(oldPath, oldPath + ".png");
      request.post(
        "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=24.fdbbae7de7ba907e9723102689513793.2592000.1678954286.282335-30420645",
        {
          form: { image: parse(`${oldPath}.png`) },
        },
        (error, res2, body) => {
          console.log(body);
          res.send(body);
        }
      );
    });
  }
});

function parse(file) {
  let filePath = path.resolve(file); // 原始文件地址

  // 读取文件数据
  let data = fs.readFileSync(filePath);
  data = Buffer.from(data).toString("base64");
  return data;
}

const port = 8888;

app.listen(port, () =>
  console.log(`server is running at http://127.0.0.1:${port}`)
);
