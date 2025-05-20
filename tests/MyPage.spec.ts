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
      .getByPlaceholder("아이디를 입력하세요")
      .fill("인천중학교110@naver.com");
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("1");
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForSelector(
      '[data-testid="student-list"] tbody tr:has-text("김민준")',
      { state: "visible", timeout: 5000 }
    );
    await page.getByTestId("user-icon").click();
    await page.getByText("개인정보").click();
    await expect(page.getByTestId("mypage-modal")).toBeVisible();
  });

  test("사진 변경 섹션과 학부모 계정 생성 섹션이 숨겨지고, 비밀번호 변경 섹션과 카카오 연동 버튼이 보여진다", async ({
    page,
  }) => {
    await expect(page.getByTestId("photo-section")).toBeHidden();
    await expect(page.getByTestId("password-section")).toBeVisible();
    await expect(page.getByTestId("kakao-button")).toBeVisible();
    await expect(page.getByTestId("parent-section")).toBeHidden();
  });

  test("빈 비밀번호 입력 후 변경 버튼 클릭 시 오류 메시지가 표시된다", async ({
    page,
  }) => {
    await page.getByTestId("password-change-button").click();
    await expect(page.getByTestId("password-error")).toBeVisible();
  });

  test("비밀번호 표시 토글 클릭 시 입력 타입이 password→text 로 변경된다", async ({
    page,
  }) => {
    const current = page.getByTestId("input-current-password");
    await expect(current).toHaveAttribute("type", "password");

    // 토글 버튼 클릭
    await page.getByTestId("password-toggle-visibility").click();
    await expect(current).toHaveAttribute("type", "text");
  });
});
