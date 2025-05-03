// tests/MainLayout.spec.ts
import { test, expect } from "@playwright/test";

test.describe("MainLayout 컴포넌트", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // 1) 앱 진입 (baseURL: playwright.config.ts에 설정된 URL)
    await page.goto(baseURL ?? "http://localhost:5173");

    // 2) API 목(mock) 설정
    await page.route("**/api/v1/school**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: 200,
          data: [{ schoolId: 123, schoolName: "인천중학교" }],
        }),
      })
    );
    await page.route("**/api/v1/auth/sign-in**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: 200,
          data: {
            accessToken: "fake-token",
            refreshToken: "fake-refresh",
            schoolId: 123,
            classId: null,
            userName: "홍길동",
            role: "TEACHER",
          },
        }),
      })
    );

    // 3) 이메일 로그인 모드로 전환
    await page.getByText("이메일로 로그인").click();

    // 4) 학교명 검색 & 선택 (디바운스 고려)
    const schoolInput = page.getByPlaceholder("학교명을 검색하세요");
    await expect(schoolInput).toBeVisible();
    await schoolInput.fill("인천");            
    await page.waitForTimeout(350);            // 디바운스 시간 대기
    await page.getByText("인천중학교").click();

    // 5) 아이디/비번 입력
    await page
      .getByPlaceholder("example@email.com")
      .fill("인천중학교110@naver.com");
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("1");

    // 6) 로그인 버튼 클릭
    await page.getByRole("button", { name: "로그인" }).click();

  });

  test("헤더와 로고, 사용자 영역이 렌더링된다", async ({ page }) => {
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("logo")).toBeVisible();
    // API 목에서 내려준 userName, role 기반 텍스트 검증
    await expect(page.getByTestId("user-area")).toContainText(
      "홍길동 선생님"
    );
  });

//   test("로고 클릭 시 /main 으로 네비게이션 된다", async ({ page }) => {
//     await page.getByTestId("logo-link").click();
//     await expect(page).toHaveURL(/\/main$/);
//   });

//   test("탭 버튼 클릭으로 올바른 경로로 이동한다", async ({ page }) => {
//     // “학생 정보” 탭 (현재 페이지)
//     await page.getByTestId("tab-student-info").click();
//     await expect(page).toHaveURL("/student-info");

    // “학생부 관리” 탭 (data-testid 추가 필요)
//     await page.getByTestId("tab-student-manage").click();
//     await expect(page).toHaveURL("/student-manage");
//   });

  test("검색 입력 후 검색 버튼 클릭 시 학생 리스트가 렌더링된다", async ({ page }) => {
    const searchInput = page.getByTestId("student-search-input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("홍길동");
    await page.getByTestId("search-button").click();
    await expect(page.getByTestId("student-list")).toBeVisible();
  });

  test("자식 컴포넌트 영역(PageArea)에 컨텐츠가 표시된다", async ({
    page,
  }) => {
    const pageArea = page.getByTestId("page-area");
    await expect(pageArea).toBeVisible();
    // children으로 넘긴 “학생 정보” 페이지 타이틀 등 검증
    await expect(pageArea).toContainText("학생 정보");
  });
});
