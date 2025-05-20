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
    await page.getByTestId("tab-counseling").click();
    await expect(page).toHaveURL("/counseling");
  });

  test("진입 시 가이드 메시지가 표시된다", async ({ page }) => {
    await expect(
      page.getByText("좌측 검색창에서 성적을 조회할 학생을 검색하세요.")
    ).toBeVisible();
  });

  test("상담 내역 테이블이 제대로 렌더링된다", async ({ page }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    // 헤더 셀
    await expect(page.getByTestId("counseling-header-id")).toHaveText("번호");
    await expect(page.getByTestId("counseling-header-title")).toHaveText(
      "제목"
    );
    await expect(page.getByTestId("counseling-header-author")).toHaveText(
      "작성자"
    );
    await expect(page.getByTestId("counseling-header-subject")).toHaveText(
      "담당과목"
    );
    await expect(page.getByTestId("counseling-header-date")).toHaveText(
      "상담일자"
    );

    // Body rows
    const rows = page.locator('[data-testid="counseling-table-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // 첫 행 셀
    const first = rows.first();
    await expect(first.getByTestId("counseling-cell-id")).toHaveText("1");
    await expect(first.getByTestId("counseling-cell-title")).toHaveText("ㅇㅇ");
    await expect(first.getByTestId("counseling-cell-author")).toHaveText(
      "박서윤"
    );
    await expect(first.getByTestId("counseling-cell-subject")).toHaveText(
      "과학"
    );
    await expect(first.getByTestId("counseling-cell-date")).toContainText(
      "2025"
    );
  });

  test("제목 유형으로 검색 시 리스트 제목에 검색어가 모두 포함되는지 확인", async ({
    page,
  }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 1) 검색 타입을 '제목'으로 설정
    await page.getByTestId("counseling-search-select").selectOption("title");

    // 2) 검색어 입력
    const searchInput = page.getByTestId("counseling-search-input");
    await expect(searchInput).toBeVisible();
    const keyword = "ㅇㅇ";
    await searchInput.fill(keyword);

    // 3) 검색 버튼 클릭
    await page.getByTestId("counseling-search-button").click();

    // 4) 결과 대기: 최소 한 건 이상
    const rows = page.locator('[data-testid="counseling-table-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // 5) 각 행의 제목 셀에 키워드 포함 여부 확인
    const titles = page.locator('[data-testid="counseling-cell-title"]');
    const titleCount = await titles.count();
    for (let i = 0; i < titleCount; i++) {
      await expect(titles.nth(i)).toContainText(keyword);
    }
  });

  test("작성자 유형으로 검색 시 리스트 작성자에 검색어가 모두 포함되는지 확인", async ({
    page,
  }) => {
    // 1) 학생 선택
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 2) 검색 타입을 '작성자'으로 설정
    await page.getByTestId("counseling-search-select").selectOption("author");

    // 3) 검색어 입력
    const searchInput = page.getByTestId("counseling-search-input");
    await expect(searchInput).toBeVisible();
    const keyword = "박서윤";
    await searchInput.fill(keyword);

    // 4) 검색 버튼 클릭
    await page.getByTestId("counseling-search-button").click();

    // 5) 결과 대기: 최소 한 건 이상
    const rows = page.locator('[data-testid="counseling-table-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // 6) 각 행의 작성자 셀에 키워드 정확히 일치하는지 확인
    const authors = page.locator('[data-testid="counseling-cell-author"]');
    const authorCount = await authors.count();
    for (let i = 0; i < authorCount; i++) {
      await expect(authors.nth(i)).toHaveText(keyword);
    }
  });

  test("담당과목 유형으로 검색 시 리스트 과목에 검색어가 정확히 일치하는지 확인", async ({
    page,
  }) => {
    // 1) 학생 선택
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 2) 검색 타입을 '담당과목'으로 설정
    await page.getByTestId("counseling-search-select").selectOption("subject");

    // 3) 검색어 입력
    const searchInput = page.getByTestId("counseling-search-input");
    await expect(searchInput).toBeVisible();
    const keyword = "과학";
    await searchInput.fill(keyword);

    // 4) 검색 버튼 클릭
    await page.getByTestId("counseling-search-button").click();

    // 5) 결과 대기: 최소 한 건 이상
    const rows = page.locator('[data-testid="counseling-table-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // 6) 각 행의 담당과목 셀에 키워드 정확히 일치하는지 확인
    const subjects = page.locator('[data-testid="counseling-cell-subject"]');
    const subjectCount = await subjects.count();
    for (let i = 0; i < subjectCount; i++) {
      await expect(subjects.nth(i)).toHaveText(keyword);
    }
  });

  test("기간 유형으로 검색 시 해당 날짜(2025-05-03)만 노출되는지 확인", async ({
    page,
  }) => {
    // 1) 학생 선택
    await page.locator('[data-testid="student-list"] tbody tr').first().click();

    // 2) 검색 타입을 '기간'으로 선택
    await page.getByTestId("counseling-search-select").selectOption("period");

    // 3) 날짜 입력 (YYYY-MM-DD 형식)
    const dateInput = page.getByTestId("counseling-search-date");
    await expect(dateInput).toBeVisible();
    await dateInput.fill("2025-05-03");

    // 4) 검색 버튼 클릭
    await page.getByTestId("counseling-search-button").click();

    // 5) 결과 대기: 최소 1건 이상
    const rows = page.locator('[data-testid="counseling-table-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // 6) 각 행의 날짜 셀을 읽어 'YYYY-MM-DD' 형태로 직접 비교
    for (let i = 0; i < rowCount; i++) {
      const dateCell = rows.nth(i).getByTestId("counseling-cell-date");
      const text = await dateCell.innerText(); // ex: "5/3/2025" 또는 "2025. 5. 3."
      const nums = text.match(/\d+/g)!.map(Number); // ex: [5,3,2025] or [2025,5,3]
      let y: number, m: number, d: number;

      // 'M/D/YYYY' 형식이면 [M,D,Y], 'YYYY. M. D.' 형식이면 [Y,M,D]
      if (nums[0] > 31) {
        [y, m, d] = nums;
      } else {
        [m, d, y] = nums;
      }

      const formatted = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      expect(formatted).toBe("2025-05-03");
    }
  });

  test("첫 번째 상담 글 클릭 시 /write로 이동하고 상세 내용이 표시된다", async ({ page }) => {
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    await page.locator('[data-testid="counseling-table-row"]').first().click();

    await expect(page).toHaveURL(/\/write$/);
  
    // 제목
    await expect(page.getByText("ㅇㅇ")).toBeVisible();
    // 다음 상담 기간
    await expect(page.getByText("다음 상담 기간")).toBeVisible();
    // 본문 내용
    await expect(page.getByText("ㅇㅇㅇㅇ")).toBeVisible();
    // 동일 교사에게만 공개
    await expect(page.getByText("동일 과목 교사에게만 공개")).toBeVisible();
    // 취소 버튼이 보임.
    const cancel = page.getByTestId("counseling-cancel-button");
    await expect(cancel).toBeVisible();
  });

  test("취소 버튼 클릭 시 이전 페이지(/counseling)로 돌아가는지 확인", async ({ page }) => {
    
    // 1) 글 선택
    await page.locator('[data-testid="student-list"] tbody tr').first().click();
    await page.locator('[data-testid="counseling-table-row"]').first().click();
    await expect(page).toHaveURL(/\/write$/);
  
    // 2) 취소 버튼 클릭
    await page.getByTestId("counseling-cancel-button").click();
  
    // 3) /counseling 으로 돌아왔는지 확인
    await expect(page).toHaveURL(`/counseling`);

  });
  
  
});

test.describe("teacher", () => {
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
      .fill("202500081");
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("893054");

    // 로그인 버튼 클릭
    await page.getByRole("button", { name: "로그인" }).click();

    // 학생 리스트 뜰 때까지 대기
    await page.waitForSelector(
      '[data-testid="student-list"] tbody tr:has-text("김민준")',
      { state: "visible", timeout: 5000 }
    );

    // 상담 페이지로 이동
    await page.getByTestId("tab-counseling").click();
    await expect(page).toHaveURL("/counseling");
  });

  test("진입 시 가이드 메시지가 표시된다", async ({ page }) => {
    await expect(
      page.getByText("좌측 검색창에서 성적을 조회할 학생을 검색하세요.")
    ).toBeVisible();
  });


  
});

test.describe("parent", () => {
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
    await page.getByTestId("tab-counseling").click();
    await expect(page).toHaveURL("/counseling");
  });

  test("진입 시 가이드 메시지가 표시된다", async ({ page }) => {
    await expect(
      page.getByText("좌측 검색창에서 성적을 조회할 학생을 검색하세요.")
    ).toBeVisible();
  });


  
});

test.describe("student", () => {
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
      .fill("202500082");
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("494413");

    // 로그인 버튼 클릭
    await page.getByRole("button", { name: "로그인" }).click();

    // 학생 리스트 뜰 때까지 대기
    await page.waitForSelector(
      '[data-testid="student-list"] tbody tr:has-text("김민준")',
      { state: "visible", timeout: 5000 }
    );

    // 상담 페이지로 이동
    await page.getByTestId("tab-counseling").click();
    await expect(page).toHaveURL("/counseling");
  });

  test("진입 시 가이드 메시지가 표시된다", async ({ page }) => {
    await expect(
      page.getByText("좌측 검색창에서 성적을 조회할 학생을 검색하세요.")
    ).toBeVisible();
  });


  
});