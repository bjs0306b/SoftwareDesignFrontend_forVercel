import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// hi
import {
  CounselingContainer,
  CounselingHeader,
  Line,
  BoardTable,
  TableHeader,
  TableCell,
  TableRow,
  TitleCell,
  Pagination,
  PageButton,
  Footer,
  SearchContainer,
  SearchSelect,
  SearchInput,
  SearchButton,
  WriteButton,
  GuideMessage,
  DateSection,
  DateInput,
} from "./CounselingPage.styled";
import { useAuthStore } from "../stores/authStore";
import { useStudentStore } from "../stores/studentStore";

interface Post {
  consultationId: number;
  studentId: number;
  teacherId: number;
  date: string;
  isPublicToSubject: boolean;
  content: string;
  nextPlan: string;
  title: string;
  subject: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const CounselingPage: React.FC = () => {
  const navigate = useNavigate();
  const selectedStudent = useStudentStore((state) => state.selectedStudent);
  const role = useAuthStore((state) => state.role);
  const schoolId = useAuthStore((state) => state.schoolId);
  const subject = useAuthStore((state) => state.subject);

  // 상태 관리
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState("title");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // 단일 날짜 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempSearchQuery, setTempSearchQuery] = useState(""); // 임시 검색어
  const [tempSelectedDate, setTempSelectedDate] = useState(""); // 임시 날짜

  const postsPerPage = 10;

  // 특정 학생 상담 내역 전체 조회
  useEffect(() => {
    if (!selectedStudent?.studentId) return;

    const fetchConsultations = async () => {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("accessToken");
      try {
        const response = await axios.get(
          `/api/v1/school/${schoolId}/consultation/students/${selectedStudent.studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("상담 내역 조회 응답:", response.data);

        if (response.data.status === 200) {
          setPosts(response.data.data);
        } else {
          setError(response.data.message || "상담 내역 조회 실패");
        }
      } catch (err) {
        console.error("API 호출 에러:", err);
        setError("상담 내역을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [selectedStudent?.studentId, schoolId]);

  const toLocalDateString = (isoString: string) => {
    const d = new Date(isoString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  // 검색 필터링
  const filteredPosts = posts.filter((post) => {
    if (post.isPublicToSubject && post.subject !== subject) {
      return false;
    }
    if (searchType === "period" && selectedDate) {
      const postLocalDate = toLocalDateString(post.date);
      return postLocalDate === selectedDate;
    }
    if (!searchQuery) return true;
    switch (searchType) {
      case "title":
        return post.title.toLowerCase().includes(searchQuery.toLowerCase());
      case "author":
        return post.author.toLowerCase().includes(searchQuery.toLowerCase());
      case "subject":
        return post.subject.toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return true;
    }
  });

  // 현재 페이지 데이터 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 핸들러
  const handleRowClick = (id: number) => {
    const selectedPost = posts.find((post) => post.consultationId === id);
    if (selectedPost) {
      navigate("/counseling/write", {
        state: { post: selectedPost, viewOnly: true },
      });
      console.log(`게시물 ${id}로 이동, 데이터 전달:`, selectedPost);
    } else {
      console.error(`ID ${id}에 해당하는 게시물을 찾을 수 없습니다.`);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    setSelectedDate(tempSelectedDate);
    setCurrentPage(1);
  };

  const handleWrite = () => {
    console.log("글 작성 페이지로 이동");
    navigate("/counseling/write");
  };

  return (
    <CounselingContainer>
      <CounselingHeader>상담 내역</CounselingHeader>
      <Line />
      {selectedStudent || role !== "TEACHER" ? (
        <>
          {loading && <GuideMessage>상담 내역을 불러오는 중...</GuideMessage>}
          {error && <GuideMessage>{error}</GuideMessage>}
          {!loading && !error && (
            <>
              <BoardTable>
                <thead data-testid="counseling-table-head">
                  <TableRow>
                    <TableHeader
                      data-testid="counseling-header-id"
                      width="3rem"
                    >
                      번호
                    </TableHeader>
                    <TableHeader
                      data-testid="counseling-header-title"
                      width="40rem"
                    >
                      제목
                    </TableHeader>
                    <TableHeader
                      data-testid="counseling-header-author"
                      width="10rem"
                    >
                      작성자
                    </TableHeader>
                    <TableHeader
                      data-testid="counseling-header-subject"
                      width="5rem"
                    >
                      담당과목
                    </TableHeader>
                    <TableHeader
                      data-testid="counseling-header-date"
                      width="13rem"
                    >
                      상담일자
                    </TableHeader>
                  </TableRow>
                </thead>
                <tbody data-testid="counseling-table-body">
                  {currentPosts.map((post, index) => (
                    <TableRow
                      key={post.consultationId}
                      data-testid="counseling-table-row"
                      onClick={() => handleRowClick(post.consultationId)}
                    >
                      <TableCell isBold data-testid="counseling-cell-id">
                        {index + 1}
                      </TableCell>
                      <TitleCell data-testid="counseling-cell-title">
                        {post.title}
                      </TitleCell>
                      <TableCell data-testid="counseling-cell-author">
                        {post.author}
                      </TableCell>
                      <TableCell data-testid="counseling-cell-subject">
                        {post.subject}
                      </TableCell>
                      <TableCell data-testid="counseling-cell-date">
                        {new Date(post.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </BoardTable>
              <Footer>
                <SearchContainer>
                  <SearchSelect
                    data-testid="counseling-search-select"
                    value={searchType}
                    onChange={(e) => {
                      setSearchType(e.target.value);
                      setSearchQuery("");
                      setSelectedDate(""); // 검색 타입 변경 시 날짜 초기화
                    }}
                  >
                    <option value="title">제목</option>
                    <option value="author">작성자</option>
                    <option value="subject">담당과목</option>
                    <option value="period">기간</option>
                  </SearchSelect>
                  {searchType === "period" ? (
                    <DateSection>
                      <DateInput
                        data-testid="counseling-search-date"
                        type="date"
                        value={tempSelectedDate}
                        onChange={(e) => setTempSelectedDate(e.target.value)} // 실시간으로 날짜를 임시 변수에 저장
                      />
                    </DateSection>
                  ) : (
                    <SearchInput
                      data-testid="counseling-search-input"
                      value={tempSearchQuery}
                      onChange={(e) => setTempSearchQuery(e.target.value)} // 실시간 업데이트가 아니라 임시 변수에 저장
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      placeholder="검색할 내용을 입력하세요."
                    />
                  )}
                  <SearchButton
                    data-testid="counseling-search-button"
                    onClick={handleSearch}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z"
                        fill="white"
                      />
                    </svg>
                  </SearchButton>
                </SearchContainer>
                {role === "TEACHER" && (
                  <WriteButton onClick={handleWrite}>글 작성</WriteButton>
                )}
              </Footer>
              <Pagination>
                <PageButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ backgroundColor: "#919EAB", color: "white" }}
                >
                  &lt;
                </PageButton>
                {Array.from({ length: totalPages }, (_, index) => (
                  <PageButton
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </PageButton>
                ))}
                <PageButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </PageButton>
              </Pagination>
            </>
          )}
        </>
      ) : (
        <GuideMessage>
          좌측 검색창에서 성적을 조회할 학생을 검색하세요.
        </GuideMessage>
      )}
    </CounselingContainer>
  );
};

export default CounselingPage;
