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
      .getByPlaceholder("example@email.com")
      .fill("인천중학교110@naver.com");
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("1");

    // 로그인 버튼 클릭
    await page.getByRole("button", { name: "로그인" }).click();

    // 학생 리스트 뜰 때까지 대기
    await page.waitForSelector(
      '[data-testid="student-list"] tbody tr:has-text("김민준")',
      { state: "visible", timeout: 5000 }
    );

    // 학생 성적 관리 페이지로 이동
    await page.getByTestId("tab-grade-manage").click();
    await expect(page).toHaveURL("/grade");
  });

  test("사이드바 학생 리스트와 성적 테이블 학생 이름이 순서까지 동일한지 검증", async ({
    page,
  }) => {
    // 1) 사이드바에서 이름만 뽑아 배열로 저장
    const sidebarRows = page.locator('[data-testid="student-list"] tbody tr');
    const sidebarCount = await sidebarRows.count();
    const sidebarNames = [];
    for (let i = 0; i < sidebarCount; i++) {
      sidebarNames.push(
        await sidebarRows.nth(i).locator("td").first().innerText()
      );
    }

    // 2) 성적 테이블의 이름 칸(첫 번째 <td>)을 동일하게 뽑아서 배열로 저장
    const gradeRows = page.locator('[data-testid="class-grade-row"]');
    await expect(gradeRows).toHaveCount(sidebarCount);
    const gradeNames = [];
    for (let i = 0; i < sidebarCount; i++) {
      gradeNames.push(await gradeRows.nth(i).locator("td").first().innerText());
    }

    // 3) 두 배열이 정확히 동일한지 비교
    expect(gradeNames).toEqual(sidebarNames);
  });

  test("학생 선택 시 기간별 과목별 테이블과 레이더 차트가 제대로 렌더링된다", async ({
    page,
  }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 1) 테이블 헤더 확인
    const headers = page.getByTestId("period-grade-table").locator("thead th");
    await expect(headers.nth(0)).toHaveText("과목");
    await expect(headers.nth(1)).toHaveText("성적");
    await expect(headers.nth(2)).toHaveText("등급");

    // 2) 과목별(5개) 행 개수
    const rows = page.locator('[data-testid="period-grade-rows"] tr');
    await expect(rows).toHaveCount(5);

    // 3) 차트 타이틀 & 컨테이너
    await expect(page.getByTestId("grade-chart-title")).toContainText("통계");
    await expect(page.getByTestId("grade-chart-box")).toBeVisible();
  });

  test("레이더 차트 레이블이 과목별 점수와 정확히 일치하는지 확인", async ({
    page,
  }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 차트 렌더링 대기
    await page.waitForTimeout(1500);

    // 1) 테이블에서 과목별 점수들 수집
    const scoreCells = page.locator(
      '[data-testid="period-grade-rows"] tr td:nth-child(2)'
    );
    const rowCount = await scoreCells.count();
    const expectedScores: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      expectedScores.push((await scoreCells.nth(i).innerText()).trim());
    }

    // 2) 차트 내 모든 <text> 엘리먼트에서 텍스트 수집 (Element[] 타입)
    const chartLabels = await page.$$eval(
      '[data-testid="grade-chart-box"] text',
      (els: any[]) => els.map((el) => el.textContent?.trim() || "")
    );
    const numericLabels = chartLabels.filter((txt) => /^\d+$/.test(txt));

    // 3) 각 예상 점수가 차트 레이블에 포함되어 있는지 확인
    for (const score of expectedScores) {
      expect(numericLabels).toContain(score);
    }
  });

  test("학년/학기 드롭다운 선택에 따라 차트 제목이 업데이트된다", async ({
    page,
  }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    // 학년을 '1학년', 학기를 '1학기'로 선택
    await page.selectOption('[data-testid="grade-select"]', "1");
    await page.selectOption('[data-testid="semester-select"]', "1");

    // 변경된 값 반영 대기
    await page.waitForTimeout(200);

    // 차트 제목이 "1학년 1학기 통계"로 정확히 표시되는지 확인
    await expect(page.getByTestId("grade-chart-title")).toHaveText(
      "1학년 1학기 통계"
    );

    // 다른 조합 예시: 2학년 2학기
    await page.selectOption('[data-testid="grade-select"]', "2");
    await page.selectOption('[data-testid="semester-select"]', "2");
    await page.waitForTimeout(200);
    await expect(page.getByTestId("grade-chart-title")).toHaveText(
      "2학년 2학기 통계"
    );
  });

  test("성적관리 → 입력 → 수정완료 시 입력란 활성화/비활성화 및 값 반영", async ({ page }) => {
    // 1) 학생 선택 
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
  
    // 2) 수정 모드 진입 전: 입력란이 숨겨져 있어야 함
    await expect(page.getByTestId("period-score-input-0")).toBeHidden();
  
    // 3) '성적관리' 버튼 클릭
    await page.getByTestId("grade-edit-button").click();
  
    // 4) 수정 모드 진입 후: 입력란이 보이고 활성화 되어야 함
    const input0 = page.getByTestId("period-score-input-0");
    await expect(input0).toBeVisible();
    await expect(input0).toBeEnabled();
  
    // 5) 값 입력
    await input0.fill("98");
  
    // 6) '수정 완료' 클릭
    await page.getByTestId("grade-save-button").click();
  
    // 7) 저장 후: 입력란이 다시 숨겨져야 함
    await expect(page.getByTestId("period-score-input-0")).toBeHidden();
  
    // 8) 그리고 텍스트가 "98" 로 변경되어야 함
    await expect(page.getByTestId("period-score-text-0")).toHaveText("98");
  });
  
  test("과목별 모드에서 테이블 헤더와 학기별 행이 제대로 렌더링된다", async ({
    page,
  }) => {

    // 학생 선택
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    // 학기 모드로 전환
    await page.getByText("과목별").click();

    // 1) 테이블 헤더 확인
    const headers = page.getByTestId("period-grade-table").locator("thead th");
    await expect(headers.nth(0)).toHaveText("학기");
    await expect(headers.nth(1)).toHaveText("성적");
    await expect(headers.nth(2)).toHaveText("등급");

    // 2) 학기별(6개: 1-1,1-2,2-1,2-2,3-1,3-2) 행 개수 확인
    const rows = page.locator('[data-testid="period-grade-table"] tbody tr');
    await expect(rows).toHaveCount(6);

    // 3) 차트 제목과 컨테이너
    await expect(page.getByTestId("grade-chart-title")).toContainText(
      "성적 통계"
    );
    await expect(page.getByTestId("grade-chart-box")).toBeVisible();
  });

  test("레이더 차트 레이블이 학기별 점수와 정확히 일치하는지 확인", async ({
    page,
  }) => {
    // 학생 선택 & 성적 페이지 진입
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 과목별 모드로 전환
    await page.getByText("과목별").click();
  
    // 렌더링 대기 (약 1.5초)
    await page.waitForTimeout(1500);
  
    // 1) 테이블에서 학기별 점수 추출 (빈 문자열은 "0"으로 처리)
    const scoreCells = page
      .getByTestId("period-grade-table")
      .locator("tbody tr td:nth-child(2)");
    const rowCount = await scoreCells.count();
    const expectedScores: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      const raw = (await scoreCells.nth(i).innerText()).trim();
      expectedScores.push(raw === "" ? "0" : raw);
    }
  
    // 2) 차트 내 <text> 요소에서 숫자 레이블만 추출
    const chartLabels = await page.$$eval(
      '[data-testid="grade-chart-box"] text',
      (els: any[]) => els.map(el => el.textContent?.trim() || "")
    );
    const numericLabels = chartLabels.filter(txt => /^\d+$/.test(txt));
  
    // 3) 각 예상 점수가 차트 레이블에 포함되어 있는지 확인
    for (const score of expectedScores) {
      expect(numericLabels).toContain(score);
    }
  });
  
  test("과목 선택 드롭다운 변경에 따라 차트 제목이 업데이트된다", async ({
    page,
  }) => {
    // 학생 선택
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    // 학기 모드로 전환
    await page.getByText("과목별").click();

    // 기본: '국어' 가 선택되어 있다고 가정
    await expect(page.getByTestId("grade-chart-title")).toHaveText(
      "국어 성적 통계"
    );

    // 1) 드롭다운에서 '과학' 선택
    await page
      .getByRole("combobox")
      .filter({ hasText: /국어/ })
      .selectOption("과학");

    // 반영 대기
    await page.waitForTimeout(200);

    // 2) 차트 제목 확인
    await expect(page.getByTestId("grade-chart-title")).toHaveText(
      "과학 성적 통계"
    );
  });

  test("과목별 성적관리 → 입력 → 수정완료 시 입력란 토글 및 값 반영", async ({
    page,
  }) => {
    // 학생 선택
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    // 학기 모드로 전환
    await page.getByText("과목별").click();


    // 1) 수정 모드 진입 전: input이 숨겨져 있어야 함
    await expect(page.getByTestId("period-score-input-0")).toBeHidden();

    // 2) '성적관리' 버튼 클릭 → input 보이고 활성화
    await page.getByTestId("grade-edit-button").click();
    const input0 = page.getByTestId("period-score-input-0");
    await expect(input0).toBeVisible();
    await expect(input0).toBeEnabled();

    // 3) 값 입력
    await input0.fill("85");

    // 4) 저장 클릭 → input이 다시 숨겨지고, 텍스트로 대체
    await page.getByTestId("grade-save-button").click();
    await expect(page.getByTestId("period-score-input-0")).toBeHidden();
    await expect(page.getByTestId("period-score-text-0")).toHaveText("85");
  });
  
});
