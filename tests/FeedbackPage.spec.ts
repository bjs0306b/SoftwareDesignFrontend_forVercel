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

    // 상담 페이지로 이동
    await page.getByTestId("tab-feedback").click();
    await expect(page).toHaveURL("/feedback");
  });

  test("진입 시 가이드 메시지가 표시된다", async ({ page }) => {
    await expect(
      page.getByText("좌측 검색창에서 성적을 조회할 학생을 검색하세요.")
    ).toBeVisible();
  });

  test("피드백 폼 4가지가 전부 렌더링되어 있는지 확인", async ({ page }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 폼이 모두 비활성화된 상태로 존재하는지 확인
    await expect(page.getByTestId("feedback-form-grade")).toBeVisible();
    await expect(page.getByTestId("feedback-form-grade")).toBeDisabled();

    await expect(page.getByTestId("feedback-form-behavior")).toBeVisible();
    await expect(page.getByTestId("feedback-form-behavior")).toBeDisabled();

    await expect(page.getByTestId("feedback-form-attendance")).toBeVisible();
    await expect(page.getByTestId("feedback-form-attendance")).toBeDisabled();

    await expect(page.getByTestId("feedback-form-attitude")).toBeVisible();
    await expect(page.getByTestId("feedback-form-attitude")).toBeDisabled();
  });

  test("피드백 수정 버튼 클릭 시 모든 폼이 활성화되는지 확인", async ({
    page,
  }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 비활성화
    await expect(page.getByTestId("feedback-form-grade")).toBeDisabled();
    await expect(page.getByTestId("feedback-form-behavior")).toBeDisabled();
    await expect(page.getByTestId("feedback-form-attendance")).toBeDisabled();
    await expect(page.getByTestId("feedback-form-attitude")).toBeDisabled();

    await page.getByRole("button", { name: "수정" }).click();

    // 활성화
    await expect(page.getByTestId("feedback-form-grade")).toBeEnabled();
    await expect(page.getByTestId("feedback-form-behavior")).toBeEnabled();
    await expect(page.getByTestId("feedback-form-attendance")).toBeEnabled();
    await expect(page.getByTestId("feedback-form-attitude")).toBeEnabled();

    const inputData = {
      GRADE: "점수 좋음",
      BEHAVIOR: "매우 협조적",
      ATTENDANCE: "정상 출결",
      ATTITUDE: "긍정적 태도",
    };

    // 각 폼에 값 채우기
    await page.getByTestId("feedback-form-grade").fill(inputData.GRADE);
    await page.getByTestId("feedback-form-behavior").fill(inputData.BEHAVIOR);
    await page
      .getByTestId("feedback-form-attendance")
      .fill(inputData.ATTENDANCE);
    await page.getByTestId("feedback-form-attitude").fill(inputData.ATTITUDE);

    // POST/PATCH 와 GET 모두 목(mock) 처리
    await page.route("**/api/v1/school/**/feedback/students/**", (route) => {
      const req = route.request();
      if (req.method() === "GET") {
        // 저장 후 fetchFeedbackData() 요청에, 우리가 입력한 내용으로 응답
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: 200,
            data: [
              { category: "GRADE", content: inputData.GRADE },
              { category: "BEHAVIOR", content: inputData.BEHAVIOR },
              { category: "ATTENDANCE", content: inputData.ATTENDANCE },
              { category: "ATTITUDE", content: inputData.ATTITUDE },
            ],
          }),
        });
      } else {
        // 저장 요청(POST or PATCH)은 무조건 성공
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: 200, data: [] }),
        });
      }
    });

    // '저장' 클릭 → 폼 비활성화
    await page.getByRole("button", { name: "저장" }).click();

    await expect(page.getByTestId("feedback-form-grade")).toBeDisabled();
    await expect(page.getByTestId("feedback-form-behavior")).toBeDisabled();
    await expect(page.getByTestId("feedback-form-attendance")).toBeDisabled();
    await expect(page.getByTestId("feedback-form-attitude")).toBeDisabled();

    // 폼 확인
    await expect(page.getByTestId("feedback-form-grade")).toHaveValue(
      inputData.GRADE
    );
    await expect(page.getByTestId("feedback-form-behavior")).toHaveValue(
      inputData.BEHAVIOR
    );
    await expect(page.getByTestId("feedback-form-attendance")).toHaveValue(
      inputData.ATTENDANCE
    );
    await expect(page.getByTestId("feedback-form-attitude")).toHaveValue(
      inputData.ATTITUDE
    );
  });
});
