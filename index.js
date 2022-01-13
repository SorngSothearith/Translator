const fs = require("fs");
const fsPromises = fs.promises;
const readline = require("readline");
const translate = require("translate-google");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let fileList = [];
let availableLang = ["en", "km", "zh-CN", "fr", "th"];
let exceptKeyLangs = ["validator"];
let translateTo = [];
(async function () {
  let files = await fsPromises.readdir("./input", async (err, files) => {
    return files;
  });
  for (let i = 0; i <= files.length - 1; i++) {
    translateTo = [];
    await getCurrentLang(files[i]).then(async (lang) => {
      await getTranslateTo(files[i]).then(async () => {
        await getMoreLang();
      });
      fileList.push({
        name: files[i],
        lang,
        translateTo,
      });
    });
  }
  rl.close();
  for (let i = 0; i < fileList.length; i++) {
    let item = fileList[i];
    let name = item.name;
    var data = JSON.parse(fs.readFileSync(`./input/${name}`, "utf8"));
    for (let j = 0; j < item.translateTo.length; j++) {
      let translateFrom = item.lang;
      let translateTo = item.translateTo[j];
      let dataTranslate = {};
      let counter = 0;
      for (let [key, value] of Object.entries(data)) {
        let newVal = value;
        if (!exceptKeyLangs.includes(key)) {
          newVal = value = await translate(value, {
            from: translateFrom,
            to: translateTo,
          })
            .then((res) => {
              return res.trim();
            })
            .catch((err) => {
              return value;
            });
        }

        dataTranslate[key] = newVal;
        console.log(`Translate success ${counter++} / ${Object.entries(data).length}`)
      }
      let fileName = name.replace('.json','')
      fs.writeFile(`./output/${fileName}_to_${translateTo}.json`, JSON.stringify(dataTranslate), (error) => {
        if (error) throw error;
      });
      console.log(`Translate ${name} from ${translateFrom} to ${translateTo} locate in ./output/${fileName}_to_${translateTo}.json`)
    }
  }
})();
async function getCurrentLang(fileName) {
  let lang = "";
  return new Promise(async (resolve, reject) => {
    await rl.question(
      `What is this file current lang of (${fileName})? [en,km,zh-CN,fr,th] `,
      async (answer) => {
        if (availableLang.includes(answer)) {
          lang = answer;
          return resolve(lang);
        } else {
          console.log("Incorrect current language try again!!");
          getCurrentLang();
        }
      }
    );
  });
}

async function getTranslateTo(fileName) {
  return new Promise(async (resolve, reject) => {
    await rl.question(
      `What is this file current lang of (${fileName}) translate to? [en,km,zh-CN,fr,th] `,
      async (answer) => {
        if (availableLang.includes(answer)) {
          translateTo.push(answer);
          return resolve();
        } else {
          console.log("Incorrect key language try again!!");
          return getTranslateTo();
        }
      }
    );
  });
}
async function getMoreLang() {
  return new Promise(async (resolve, reject) => {
    await rl.question(
      `Want to add more translate to? [en,km,zh-CN,fr,th] (n = exits) `,
      async (answerMore) => {
        if (answerMore == "n") {
          return resolve();
        } else {
          if (availableLang.includes(answerMore)) {
            translateTo.push(answerMore);
            await getMoreLang();
            return resolve();
          } else {
            console.log("Incorrect key language try again!!");
            await getMoreLang();
            return resolve();
          }
        }
      }
    );
  });
}
