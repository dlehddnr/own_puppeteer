const puppeteer = require("puppeteer");

const DAY = [
  "#CP1_chkSun",
  "#CP1_chkMon",
  "#CP1_chkTus",
  "#CP1_chkWed",
  "#CP1_chkThs",
  "#CP1_chkFri",
  "#CP1_chkSat"
];

const input = {
  username: "",
  password: ""
};

const PAGE_URL = {
  home: "https://uwins.ulsan.ac.kr/",
  ground:
    "https://uwins.ulsan.ac.kr/DHSW/A/MJA03U_02.aspx?status=U&yy=2019&haengsa_no=02768"
};

async function run() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for (var i = 0; i < 1; i++) {
    await page.goto(PAGE_URL.home);
    await page.type("#CP1_id", input.username);
    await page.type("#CP1_pw", input.password);
    await page.click("#CP1_btnLogin");
  }
  await page.waitForNavigation();
  await page.goto(PAGE_URL.ground, { waitUntil: "networkidle2" });
  // 시설물 예약 등록 페이지
  const newPagePromise = new Promise(x =>
    browser.once("targetcreated", target => x(target.page()))
  );
  await page.waitForSelector("#CP1_btnYeyag");
  await page.click("#CP1_btnYeyag");
  const newPage = await newPagePromise;

  // 대관호실 조회 페이지
  const newPagePromise1 = new Promise(x =>
    browser.once("targetcreated", target => x(target.page()))
  );
  await newPage.waitForSelector("#CP1_btnloc");
  await newPage.click("#CP1_btnloc");
  const newPage1 = await newPagePromise1;

  // 종합운동장 A 면 클릭 (대관호실 조회 페이지)
  await newPage1.waitForSelector("#CP1_grdView1_lbtn1_77");
  await newPage1.click("#CP1_grdView1_lbtn1_77");

  // 날짜 설정 ( 시설물 예약 등록 페이지)
  await newPage.click("#CP1_txtFrDt", { clickCount: 3 });
  await newPage.type("#CP1_txtFrDt", "2019.04.21");
  await newPage.click("#CP1_txtToDt", { clickCount: 3 });
  await newPage.type("#CP1_txtToDt", "2019.04.21");

  // 요일 선택
  await newPage.click(DAY[0]);

  // 시작 시간
  await newPage.click("#CP1_ddlFrTm");
  await newPage.type("#CP1_ddlFrTm", "12");

  // 종료 시간
  await newPage.click("#CP1_ddlToTm");
  await newPage.type("#CP1_ddlToTm", "16");

  // 팝업 끄기
  await newPage.on("dialog", async dialog => {
    await dialog.dismiss();
    // await browser.close();
  });

  // // 조회
  await newPage.waitForSelector("#CP1_btnRetrieve");
  for (i = 0; i < 40; i++) {
    await Promise.all([
      await newPage.click("#CP1_btnRetrieve"),
      await newPage.waitForSelector("#CP1_btnRetrieve"),
      console.log(i)
    ]);
    if ((await newPage.$("#CP1_grdView1_chkSel_0")) !== null) {
      console.log("found");
      await newPage.click("#CP1_grdView1_chkSel_0");
      i = 40;
    } else console.log("not found");
  }

  // 예약
  await newPage.waitForSelector("#CP1_btnYeyag");
  await newPage.click("#CP1_btnYeyag");

  newPage.close();

  await page.focus("#CP1_btnEtc3");
  await page.keyboard.press("Enter");
}

run();
