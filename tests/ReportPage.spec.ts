import { test, expect } from "@playwright/test";

test.describe("homeroom teacher", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "http://localhost:5173");
    await page.getByText("이메일로 로그인").click();
    const schoolInput = page.getByPlaceholder("학교명을 검색하세요");
    await expect(schoolInput).toBeVisible();
    await schoolInput.fill("인천");
    await page.waitForTimeout(350);
    await page.getByText("인천중학교").click();
    await page
      .getByPlaceholder("example@email.com")
      .fill("인천중학교110@naver.com");
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("1");
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForSelector(
      '[data-testid="student-list"] tbody tr:has-text("김민준")',
      { state: "visible", timeout: 5000 }
    );
    await page.getByTestId("tab-report").click();
    await expect(page).toHaveURL("/report");
  });

  test("첫 진입 시 가이드 메시지 & 기본 드롭다운 노출", async ({ page }) => {
    // 가이드 문구 존재
    await expect(
      page.getByText("좌측의 검색창에서 보고서를 생성할 학생을 선택하세요.")
    ).toBeVisible();

    // 기본 타입 = score
    await expect(page.getByTestId("select-type")).toHaveValue("score");
    await expect(page.getByTestId("select-grade")).toBeVisible();
    await expect(page.getByTestId("select-semester")).toBeVisible();
  });

  /* ---------- 타입 전환 ---------- */
  test("타입을 counseling으로 바꾸면 검색창 노출 & grade/semester 숨김", async ({
    page,
  }) => {
    await page.getByTestId("select-type").selectOption("counseling");

    await expect(page.getByTestId("counseling-search-box")).toBeVisible();
    await expect(page.getByTestId("select-grade")).toBeHidden();
    await expect(page.getByTestId("select-semester")).toBeHidden();
  });

  test("타입을 feedback으로 바꾸면 grade만 노출 & semester 숨김", async ({
    page,
  }) => {
    await page.getByTestId("select-type").selectOption("feedback");

    await expect(page.getByTestId("select-grade")).toBeVisible();
    await expect(page.getByTestId("select-semester")).toBeHidden();
    await expect(page.getByTestId("counseling-search-box")).toBeHidden();
  });

  /* ---------- 학생 선택 후 성적 보고서 ---------- */
  test("학생을 선택하면 ScoreReport 컴포넌트가 렌더링된다", async ({
    page,
  }) => {
    // 학생 선택
    await page
      .locator('[data-testid="student-list"] tbody tr:has-text("김민준")')
      .click();

    // 가이드 문구가 사라지고 report-container가 표시
    await expect(
      page.getByText("좌측의 검색창에서 보고서를 생성할 학생을 선택하세요.")
    ).toBeHidden();
    await expect(page.getByTestId("report-container")).toBeVisible();

    // 과목 셀 검증 (role=cell 사용)
    for (const subj of ["국어", "영어", "수학", "과학", "사회"]) {
      await expect(
        page.getByTestId("report-container").getByRole("cell", { name: subj })
      ).toBeVisible();
    }
  });

  /* ---------- Excel / PDF 토글 ---------- */
  test("Excel ↔ PDF 토글 스위치 동작", async ({ page }) => {
    const exportToggle = page.getByTestId("export-toggle");
    const excelLabel = exportToggle.getByText("Excel");
    const pdfLabel = exportToggle.getByText("PDF");

    // 초기: Excel 활성
    await expect(excelLabel).toHaveCSS("color", "rgb(0, 0, 0)");
    await pdfLabel.click();
    await expect(pdfLabel).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(excelLabel).toHaveCSS("color", "rgb(133, 133, 133)");

    // 다시 Excel
    await excelLabel.click();
    await expect(excelLabel).toHaveCSS("color", "rgb(0, 0, 0)");
  });

  /* ---------- 상담 검색 & 상세 ---------- */
  test("counseling 검색 → 결과 테이블 → 상세 뷰", async ({ page }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    await page.getByTestId("select-type").selectOption("counseling");

    // 상담 검색창 활성화
    await page.getByPlaceholder("상담 제목 검색").fill("ㅇㅇ");
    await page.locator('input[placeholder="상담 제목 검색"] + button').click();
    await page.waitForTimeout(350);

    // 첫번째 행 클릭

    // 1) 테이블이 생길 때까지 대기
    await page.waitForSelector('[data-testid="counseling-search-table"]');

    // 2) tbody 첫 번째 행 선택
    const row = page
      .locator('[data-testid="counseling-search-table"] tbody tr')
      .first();

    await expect(row).toBeVisible(); // 이제 찾힘

    // 상세 뷰 진입
    await row.click();
    await page.waitForSelector('[data-testid="counseling-detail"]');
    await expect(page.getByText("ㅇㅇㅇㅇ")).toBeVisible();
  });

  /* ---------- 피드백 보고서 ---------- */
  test("feedback 타입에서 피드백 항목이 표시된다", async ({ page }) => {
    // 학생 선택 & 타입 변경
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    await page.getByTestId("select-type").selectOption("feedback");

    // 보고서 컨테이너가 뜰 때까지 대기
    const report = page.getByTestId("feedback-report");
    await expect(report).toBeVisible();

    // 'ㅇㅇ' 텍스트가 네 군데(성적‧행동‧출결‧태도) 모두 렌더링됐는지 확인
    await expect(report.getByText("ㅇㅇ", { exact: true })).toHaveCount(4);
  });
});
