// tests/MainLayout.spec.ts
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

  });

  test("헤더와 로고, 사용자 영역이 렌더링된다", async ({ page }) => {
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("logo")).toBeVisible();
    page.getByText("박서윤");
  });

  test("로고 클릭 시 /main 으로 네비게이션 된다", async ({ page }) => {
    await page.getByTestId("logo-link").click();
    await expect(page).toHaveURL(/\/main$/);
  });

  test('페이지 진입 시 반 학생 리스트가 자동으로 렌더링된다', async ({ page }) => {

    // 학생 리스트가 렌더링되는지 확인합니다.
    await expect(page.getByTestId("student-list")).toBeVisible();
    // tbody의 모든 tr(row)를 찾습니다.
    const rows = page.locator('[data-testid="student-list"] tbody tr');
    const count = await rows.count();
    // 각 행마다 1학년(grade) · 1반(gradeClass) 이 맞는지 검증
    for (let i = 0; i < count; i++) {
      const gradeCell = rows.nth(i).locator('td').nth(1);
      const classCell = rows.nth(i).locator('td').nth(2);
      await expect(gradeCell).toHaveText('1');
      await expect(classCell).toHaveText('1');
    }
  });

  test("탭 버튼 클릭으로 올바른 경로로 이동한다", async ({ page }) => {
    await page.getByTestId("tab-student-manage").click();
    await expect(page).toHaveURL("/student-manage");
    await page.getByTestId("tab-student-info").click();
    await expect(page).toHaveURL("/student-info");
    await page.getByTestId("tab-grade-manage").click();
    await expect(page).toHaveURL("/grade");
    await page.getByTestId("tab-counseling").click();
    await expect(page).toHaveURL("/counseling");
    await page.getByTestId("tab-feedback").click();
    await expect(page).toHaveURL("/feedback");
    await page.getByTestId("tab-report").click();
    await expect(page).toHaveURL("/report");
  });

  test("검색 입력 후 검색 버튼 클릭 시 학생 리스트가 렌더링된다", async ({
    page,
  }) => {
    const searchInput = page.getByTestId("student-search-input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("김");
    await page.getByTestId("search-button").click();
    
    // 잠깐 대기
    await page.waitForTimeout(1000); // 1초 대기
    // 각 줄마다 '김'이 포함된 학생이 맞는지 검증
    const rows = page.locator('[data-testid="student-list"] tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const nameCell = rows.nth(i).locator('td').nth(0);
      await expect(nameCell).toContainText('김');
    }
  });
});
