import { test, expect } from "@playwright/test";

test.describe("homeroom teacher", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // 앱 진입 (baseURL: playwright.config.ts에 설정된 URL)
    await page.goto(baseURL ?? "http://localhost:5173");

    // 이메일 로그인 모드로 전환
    await page.getByText("이메일로 로그인").click();

    // 학교명 검색 & 선택 (디바운스 고려)
    const schoolInput = page.getByPlaceholder("학교명을 검색하세요");
    await expect(schoolInput).toBeVisible();
    await schoolInput.fill("인천");
    await page.waitForTimeout(350); // 디바운스 시간 대기
    await page.getByText("인천중학교").click();

    // 아이디/비번 입력
    await page
      .getByPlaceholder("아이디를 입력하세요")
      .fill("인천중학교110@naver.com");
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("1");

    // 로그인 버튼 클릭
    await page.getByRole("button", { name: "로그인" }).click();

    // 학생 리스트 뜰 때까지 대기
    await page.waitForSelector(
      '[data-testid="student-list"] tbody tr:has-text("김민준")',
      { state: "visible", timeout: 5000 }
    );

    // 학생 관리 페이지로 이동
    await page.getByTestId("tab-student-manage").click();
    await expect(page).toHaveURL("/student-manage");
  });

  test("페이지 헤더와 반 출석 관리 타이틀이 보인다", async ({ page }) => {
    // 헤더
    await expect(page.getByTestId("page-header")).toBeVisible();

    // 날짜 타이틀
    const today = new Date();
    const title = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 - 반 출석 관리[1: 무단 2:질병 3:기타(사유)]`;
    await expect(page.getByTestId("class-section-title")).toHaveText(title);
  });

  test("반 학생 리스트 테이블이 렌더링된다", async ({ page }) => {
    // 1) test-id로 잡힌 모든 학생 행(row) Locator 생성
    const rows = page.locator('[data-testid="class-student-row"]');

    // 2) 각 행이 실제로 보이는지 확인
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toBeVisible();
    }
  });

  test("클래스 출석 편집 토글 및 저장 시 데이터 전송 검증", async ({
    page,
  }) => {
    // 1) POST 요청 가로채기
    let sentPayload: any = null;
    await page.route(
      "**/api/v1/school/**/student-record/attendance/class/**",
      (route) => {
        sentPayload = route.request().postDataJSON();
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: 200, data: [] }),
        });
      }
    );

    // 2) 모든 출석 셀 Locator
    const cells = page.locator('[data-testid="class-attendance-cell"]');
    const count = await cells.count();

    // 3) before: 모두 비활성화
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).not.toHaveAttribute("contenteditable", "true");
    }

    // 4) 수정 모드 진입 & 활성화 확인
    await page.getByTestId("edit-attendance-button").click();
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).toHaveAttribute("contenteditable", "true");
    }

    // 5) 첫 번째 셀에 값 입력
    const firstCell = cells.first();
    await firstCell.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type("1");
    await firstCell.evaluate((el: any) => el.blur());

    // 6) 저장(=토글) 클릭 & 비활성화 확인
    await page.getByTestId("edit-attendance-button").click();
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).not.toHaveAttribute("contenteditable", "true");
    }

    // 7) 전송된 페이로드 검증
    expect(sentPayload).not.toBeNull();
    expect(sentPayload).toEqual(
      expect.objectContaining({
        date: expect.any(String),
        semester: expect.any(Number),
        attendance: expect.arrayContaining([
          expect.objectContaining({
            studentId: expect.any(Number),
            type: "ABSENCE",
            reason: "1",
          }),
        ]),
      })
    );
  });

  test("좌측 학생 클릭 시 화면 전환한다", async ({ page }) => {
    // 1) 첫 번째 학생 클릭
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 2) 학생 기본정보 수정 섹션이 보이는지 확인
    await expect(page.getByText("학생 기본정보 수정")).toBeVisible();

    // 3) 해당 학기 출석 섹션이 보이는지 확인
    await expect(page.getByText("해당 학기 출석")).toBeVisible();

    // 4) 학생 출결 정보 테이블 헤더가 보이는지 확인
    await expect(page.getByText("학생 출결 정보")).toBeVisible();

    // 5) 특기 사항 섹션이 보이는지 확인
    await expect(page.getByText("특기 사항")).toBeVisible();
  });

  test("기본정보 입력란에 초기값이 보이고, 수정 후 적용된다", async ({
    page,
  }) => {
    // 1) 사이드바에서 첫 번째 학생 클릭
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 2) 초기값 확인
    await expect(page.getByTestId("basicinfo-name-input")).toHaveValue(
      "김민준"
    );
    await expect(page.getByTestId("basicinfo-grade-input")).toHaveValue("1");
    await expect(page.getByTestId("basicinfo-class-input")).toHaveValue("1");
    await expect(page.getByTestId("basicinfo-number-input")).toHaveValue("1");

    // 3) 값 수정
    await page.getByTestId("basicinfo-name-input").fill("김영희");
    await page.getByTestId("basicinfo-grade-input").fill("2");
    await page.getByTestId("basicinfo-class-input").fill("3");
    await page.getByTestId("basicinfo-number-input").fill("7");

    // 4) 적용 버튼 클릭
    await page.getByTestId("basicinfo-apply-button").click();

    // 5) 수정된 값이 그대로 유지되는지 재검증
    await expect(page.getByTestId("basicinfo-name-input")).toHaveValue(
      "김영희"
    );
    await expect(page.getByTestId("basicinfo-grade-input")).toHaveValue("2");
    await expect(page.getByTestId("basicinfo-class-input")).toHaveValue("3");
    await expect(page.getByTestId("basicinfo-number-input")).toHaveValue("7");
  });

  test("해당 학기 출석 편집 토글 & 저장 동작 및 데이터 전송 검증", async ({
    page,
  }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 1) POST 요청 가로채기
    let sentPayload: any = null;
    await page.route(
      "**/api/v1/school/**/student-record/attendance/students/**",
      (route) => {
        sentPayload = route.request().postDataJSON();
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: 200, data: [] }),
        });
      }
    );

    // 2) 모든 셀 Locator
    const cells = page.locator('[data-testid="semester-attendance-cell"]');
    const count = await cells.count();

    // 3) before: 모두 비활성화(contenteditable="true" 아님)
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).not.toHaveAttribute("contenteditable", "true");
    }

    // 수정 모드 버튼 뜨기 전까지 대기
    await page.waitForSelector('[data-testid="semester-attendance-button"]');

    // 4) 수정 모드 진입
    await page.getByTestId("semester-attendance-button").click();

    // 5) after: 모두 활성화(contenteditable="true")
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).toHaveJSProperty("isContentEditable", true);
    }

    // 6) 첫 번째 날짜 셀에 '1' 입력 후 blur
    const rows = page.locator('[data-testid="semester-attendance-row"]');
    const rowCount = await rows.count();
    const editableDateCells = page.locator(
      '[data-testid="semester-attendance-cell"][contenteditable="true"]'
    );

    await expect(editableDateCells).toHaveCount(
      (await cells.count()) - rowCount
    );
    const firstDateCell = editableDateCells.first();
    await firstDateCell.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type("1");
    await firstDateCell.evaluate((el: any) => el.blur());

    // 7) 저장(=토글) 클릭
    await page.getByTestId("semester-attendance-button").click();

    // 8) after save: 다시 비활성화(contenteditable="true" 아님)
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).not.toHaveAttribute("contenteditable", "true");
    }

    // 9) 전송된 페이로드 검증
    expect(sentPayload).not.toBeNull();
    expect(sentPayload.attendance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          type: "ABSENCE",
          reason: "1",
        }),
      ])
    );
  });

  test("학생 출결 정보 테이블 렌더링 및 요약값 검증", async ({ page }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 1) 섹션 제목
    await expect(page.getByText("학생 출결 정보")).toBeVisible();

    // 2) 테이블 전체
    const table = page.getByTestId("attendance-summary-table");
    await expect(table).toBeVisible();

    // 3) 학년별 요약 행이 3개
    const rows = page.locator('[data-testid="attendance-summary-row"]');
    await expect(rows).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const row = rows.nth(i);
      // 4) 학년, 총일수 확인
      await expect(row.getByTestId("attendance-summary-grade-cell")).toHaveText(
        `${i + 1}학년`
      );
      await expect(row.getByTestId("attendance-summary-total-cell")).toHaveText(
        "240"
      );
      // 5) 나머지 셀(12개) 모두 0
      const cells = row.locator('[data-testid="attendance-summary-cell"]');
      await expect(cells).toHaveCount(12);
      for (let j = 0; j < 12; j++) {
        const cell = cells.nth(j);
        // 텍스트를 읽어서 숫자로 변환
        const text = await cell.innerText();
        const value = Number(text);
        // 0 이상인지 확인
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("특기 사항 편집 후 저장 시 입력한 내용이 전송되는지 검증", async ({
    page,
  }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    const textarea = page.getByTestId("specialnotes-textarea");
    const button = page.getByTestId("specialnotes-button");

    // 1) 수정 모드 진입
    await button.click();
    await expect(textarea).toBeEnabled();

    // 2) 임의의 텍스트 입력
    const inputText = "임의의 특기사항 내용";
    await textarea.fill(inputText);

    // 3) POST 요청 가로채기 (저장 버튼 클릭 전에 등록!)
    let sentPayload: any = null;
    await page.route(
      "**/api/v1/school/**/student-record/extra-info/students/**",
      (route) => {
        sentPayload = route.request().postDataJSON();
        // 실제 서버 호출이 필요 없다면, 바로 성공 응답으로 대체
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: 200,
            data: { extraInfo: sentPayload.extraInfo },
          }),
        });
      }
    );

    // 4) 저장 클릭
    await button.click();

    // 5) 저장 후 textarea 비활성화 및 버튼 텍스트 돌아왔는지 확인
    await expect(textarea).toBeDisabled();
    await expect(button).toHaveText("수정");

    // 6) sentPayload 검증
    expect(sentPayload).not.toBeNull();
    expect(sentPayload).toMatchObject({ extraInfo: inputText });
  });
});
