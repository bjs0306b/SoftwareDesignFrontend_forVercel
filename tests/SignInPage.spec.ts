// tests/SignInPage.spec.ts
import { test, expect } from "@playwright/test";

test.describe("SignInPage", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // baseURL은 playwright.config.ts에서 설정되어 있다면 생략 가능
    await page.goto(baseURL ?? "http://localhost:5173");
  });

  test("초기 화면에 카카오/이메일 로그인 버튼이 보인다", async ({ page }) => {
    // KakaoButton, EmailButton 모두 <div>라 getByRole로 안잡히므로 getByText로 찾습니다.
    await expect(page.getByText("카카오로 로그인")).toBeVisible();
    await expect(page.getByText("이메일로 로그인")).toBeVisible();
  });

  test("이메일 로그인으로 전환하면 입력 폼이 나타난다", async ({ page }) => {
    // 이메일 로그인 토글 클릭
    await page.getByText("이메일로 로그인").click();

    // 입력 폼 요소들
    await expect(page.getByPlaceholder("학교명을 검색하세요")).toBeVisible();
    await expect(page.getByPlaceholder("example@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("비밀번호를 입력하세요")).toBeVisible();
    // 실제 로그인 버튼(SignButton 은 <button> 이므로 getByRole 사용 가능)
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("학교를 선택하지 않고 로그인 시도하면 경고 다이얼로그가 뜬다", async ({ page }) => {
    // 이메일 로그인 모드로 전환
    await page.getByText("이메일로 로그인").click();

    // dialog 이벤트 리스너 등록
    page.once("dialog", async dialog => {
      expect(dialog.message()).toContain(
        "학교명을 검색 후 리스트에서 선택해주세요"
      );
      await dialog.accept();
    });

    // 로그인 버튼 클릭 (alert 발생)
    await page.getByRole("button", { name: "로그인" }).click();
  });
});
