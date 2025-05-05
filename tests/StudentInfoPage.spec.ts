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

    // student-list 뜰 때까지 대기
    await page.waitForSelector(
      '[data-testid="student-list"] tbody tr:has-text("김민준")',
      { state: "visible", timeout: 5000 }
    );
    
    // 학생 성적 조회 페이지로 이동
    await page.getByTestId("tab-student-info").click();
    await expect(page).toHaveURL("/student-info");
  });

  test("진입 시 가이드 메시지가 표시된다", async ({ page }) => {
    await expect(
      page.getByText("좌측 검색창에서 성적을 조회할 학생을 검색하세요.")
    ).toBeVisible();
  });

  test("학생 선택 시 상세정보 테이블이 표시된다", async ({ page }) => {
    // 1) 학생 리스트에서 첫 번째 학생을 클릭
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 3초대기
    await page.waitForTimeout(3000);

    // 2) 학생 정보 테이블이 렌더링되는지 확인합니다.
    await expect(page.getByText("전화번호")).toBeVisible();
    await expect(page.getByText("집주소")).toBeVisible();
    await expect(page.getByText("부모님 연락처")).toBeVisible();

    const phones = page.getByText("010-xxxx-xxxx");
    // 두 개가 맞는지 먼저 확인
    await expect(phones).toHaveCount(2);
    // 각각 visible 여부 검사
    await expect(phones.nth(0)).toBeVisible();
    await expect(phones.nth(1)).toBeVisible();

    await expect(page.getByText("인천광역시 연수구 xxx로 312-1")).toBeVisible();
  });
});
