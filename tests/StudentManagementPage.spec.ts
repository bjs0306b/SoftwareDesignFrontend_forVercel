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

    // 학생 관리 페이지로 이동
    await page.getByTestId("tab-student-manage").click();
    await expect(page).toHaveURL("/student-manage");
  });

  test("페이지 헤더와 반 출석 관리 타이틀이 보인다", async ({ page }) => {
    // 헤더
    await expect(page.getByTestId("page-header")).toBeVisible();
  
    // 날짜 타이틀
    const today = new Date();
    const title = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일 - 반 출석 관리`;
    await expect(page.getByTestId("class-section-title")).toHaveText(title);
  });
  
  test("반 학생 리스트 테이블이 렌더링된다", async ({ page }) => {
    const rows = page.getByTestId("student-row");
    await expect(rows).toHaveCount(2);
  });
  
  test("수정 버튼 클릭 시 출석 셀에 편집 모드가 활성화된다", async ({ page }) => {
    // before: 비활성화
    const cell = page.getByTestId("attendance-cell").first();
    await expect(cell).not.toHaveAttribute("contenteditable", "true");
  
    // 수정 클릭
    await page.getByTestId("edit-button").click();
    await expect(cell).toHaveAttribute("contenteditable", "true");
  });
  
  test("반 학생 정보가 없으면 안내 메시지가 표시된다", async ({ page }) => {
    // 빈 데이터 목(mock) 후 reload
    // ...
    await page.reload();
    await expect(page.getByTestId("empty-message")).toBeVisible();
  });
  
});
