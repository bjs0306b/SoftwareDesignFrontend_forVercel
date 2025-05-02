import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "../api/axiosInstance";
import {
  Line,
  MainContainer,
  OptionButton,
  ReportContainer,
  SaveButton,
  ToggleButton,
  ToggleWrapper,
  ButtonArea,
  DropdownBox,
  DropDown,
  ControlContainer,
  SearchBox,
  SearchButton,
  GuideContainer,
} from "./ReportPage.styled";
import ScoreReport from "../components/ScoreReport";
import CounselingReport from "../components/CounselingReport";
import FeedBackReport from "../components/FeedbackReport";
import { useStudentStore } from "../stores/studentStore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as xlsx from "xlsx";
import { saveAs } from "file-saver";
import { useAuthStore } from "../stores/authStore";
import CounselingSearchTable from "../components/CounselingSearchTable";

interface StudentGrade {
  subject: string;
  score: number;
  schoolYear: number;
  semester: number;
}

interface FeedbackItem {
  schoolYear: number;
  category: "GRADE" | "BEHAVIOR" | "ATTENDANCE" | "ATTITUDE";
  content: string;
}

interface CounselingItem {
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

interface ScoreRow {
  subject: string;
  score: number;
  grade: number;
}

type ScoreExcelRow = {
  과목: string;
  점수: number;
  등급: number;
};

type CounselingExcelRow = {
  제목: string;
  담당자: string;
  내용: string;
};

type FeedbackExcelRow = {
  항목: string;
  내용: string;
};

const subjects = ["국어", "영어", "수학", "과학", "사회"];

const ReportPage: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState("1");
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [isExcel, setIsExcel] = useState(true);
  const [selectedType, setSelectedType] = useState("score");
  const reportRef = useRef<HTMLDivElement>(null);

  //성적 보고서 용
  const [semesterTableData, setSemesterTableData] = useState<ScoreRow[]>([]);
  const [radarSemesterData, setRadarSemesterData] = useState<
    { name: string; value: number }[]
  >([]);
  const selectedStudent = useStudentStore((state) => state.selectedStudent);
  const schoolId = useAuthStore((state) => state.schoolId);

  //상담내역 보고서 용
  const [counselingResults, setCounselingResults] = useState<CounselingItem[]>(
    []
  );
  const [counselingQuery, setCounselingQuery] = useState("");
  const [selectedCounseling, setSelectedCounseling] =
    useState<CounselingItem | null>(null);
  const subject = useAuthStore((state) => state.subject);

  //피드백 보고서 용
  const [feedbacks, setFeedbacks] = useState<
    Record<FeedbackItem["category"], string>
  >({
    GRADE: "",
    BEHAVIOR: "",
    ATTENDANCE: "",
    ATTITUDE: "",
  });

  useEffect(() => {
    const fetchGradeData = async () => {
      if (!selectedStudent) return;
      try {
        const response = await axios.get(
          `/school/${schoolId}/grades/students/${selectedStudent.studentId}`,
          {
            params: {
              schoolYear: selectedGrade,
              semester: selectedSemester,
            },
          }
        );

        const grades = response.data.grades as StudentGrade[];

        const gradeMap = new Map(grades.map((g) => [g.subject, g.score]));

        const merged = subjects.map((subj) => {
          const score = gradeMap.get(subj) ?? 0;
          return {
            subject: subj,
            score,
            grade: Math.ceil((100 - score) / 10),
          };
        });

        setSemesterTableData(merged);
        setRadarSemesterData(
          merged.map((g) => ({
            name: g.subject,
            value: g.score,
          }))
        );
      } catch (err) {
        console.error("성적 데이터 불러오기 실패", err);
        const empty = subjects.map((subj) => ({
          subject: subj,
          score: 0,
          grade: 10,
        }));
        setSemesterTableData(empty);
        setRadarSemesterData(
          empty.map((g) => ({
            name: g.subject,
            value: g.score,
          }))
        );
      }
    };

    if (selectedType === "score") {
      fetchGradeData();
    }
  }, [
    selectedGrade,
    selectedSemester,
    selectedStudent,
    selectedType,
    schoolId,
  ]);

  const fetchCounselingByTitle = async () => {
    if (!selectedStudent || !counselingQuery.trim()) return;

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await axios.get(
        `/school/${schoolId}/consultation/students/${selectedStudent.studentId}/search`,
        {
          params: { title: counselingQuery },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        const filtered = response.data.data.filter(
          (item: CounselingItem) =>
            !item.isPublicToSubject || item.subject === subject
        );
        setCounselingResults(filtered);
        setSelectedCounseling(null);
      }
    } catch (err) {
      console.error("상담 검색 실패:", err);
    }
  };

  //상담 검색 초기화
  useEffect(() => {
    if (!selectedStudent) return;
    setSelectedCounseling(null);
    setCounselingResults([]);
  }, [selectedStudent]);

  //피드백 불러오기
  const fetchFeedbackData = useCallback(async () => {
    if (!selectedStudent) return;
    const token = sessionStorage.getItem("accessToken");
    if (!token || !schoolId) return;

    try {
      const response = await axios.get(
        `/school/${schoolId}/feedback/students/${selectedStudent.studentId}?schoolYear=${selectedGrade}`
      );

      if (response.data.status === 200) {
        const newFeedbacks: Record<FeedbackItem["category"], string> = {
          GRADE: "",
          BEHAVIOR: "",
          ATTENDANCE: "",
          ATTITUDE: "",
        };

        (response.data.data as FeedbackItem[]).forEach((item) => {
          newFeedbacks[item.category] = item.content;
        });

        setFeedbacks(newFeedbacks);
      }
    } catch (err) {
      console.error("피드백 데이터 조회 실패:", err);
    }
  }, [selectedStudent, selectedGrade, schoolId]);

  useEffect(() => {
    if (selectedType === "feedback") {
      fetchFeedbackData();
    }
  }, [selectedType, selectedStudent, selectedGrade, fetchFeedbackData]);

  const getPdfFileName = () => {
    if (!selectedStudent) return "report.pdf";

    let reportType = "";
    if (selectedType === "score") reportType = "성적보고서";
    if (selectedType === "counseling") reportType = "상담내역";
    if (selectedType === "feedback") reportType = "피드백내역";

    return `${selectedStudent.name}_${reportType}.pdf`;
  };

  //pdf 생성
  const generatePDF = async () => {
    if (!reportRef.current || !selectedStudent) return;

    const element = reportRef.current;

    //기존 스타일 백업
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;

    try {
      // 캡처 전 스타일 해제
      element.style.maxHeight = "none";
      element.style.overflow = "visible";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const marginX = -20;
      const marginY = 20;

      const imgWidth = pdfWidth - marginX * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = marginY;

      // 첫 페이지 삽입
      pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - marginY * 2;

      // 여러 페이지 분할
      while (heightLeft > 0) {
        position = marginY - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - marginY * 2;
      }

      pdf.save(getPdfFileName());
    } finally {
      //캡처 끝나면 스타일 복원
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
    }
  };

  const getExcelFileName = () => {
    if (!selectedStudent) return "report.xlsx";

    let reportType = "";
    if (selectedType === "score") reportType = "성적보고서";
    if (selectedType === "counseling") reportType = "상담내역";
    if (selectedType === "feedback") reportType = "피드백내역";

    return `${selectedStudent.name}_${reportType}.xlsx`;
  };

  //excel 생성
  const generateExcel = () => {
    if (!selectedStudent) return;

    let data: ScoreExcelRow[] | CounselingExcelRow[] | FeedbackExcelRow[] = [];

    if (selectedType === "score") {
      data = semesterTableData.map((row) => ({
        과목: row.subject,
        점수: row.score,
        등급: row.grade,
      }));
    } else if (selectedType === "counseling" && selectedCounseling) {
      data = [
        {
          제목: selectedCounseling.title,
          담당자: selectedCounseling.author,
          내용: selectedCounseling.content,
        },
      ];
    } else if (selectedType === "feedback") {
      data = [
        { 항목: "성적", 내용: feedbacks.GRADE },
        { 항목: "행동", 내용: feedbacks.BEHAVIOR },
        { 항목: "출결", 내용: feedbacks.ATTENDANCE },
        { 항목: "태도", 내용: feedbacks.ATTITUDE },
      ];
    }

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = xlsx.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, getExcelFileName());
  };

  const handleSave = () => {
    if (isExcel) {
      generateExcel();
    } else {
      generatePDF();
    }
  };

  return (
    <MainContainer>
      <h1>보고서 생성</h1>
      <Line />
      <ControlContainer>
        <DropdownBox>
          <DropDown
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="score">성적 보고서</option>
            <option value="counseling">상담 내역 보고서</option>
            <option value="feedback">피드백 내역 보고서</option>
          </DropDown>
          {selectedType === "score" && (
            <>
              <DropDown
                id="grade"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
              </DropDown>
              <DropDown
                id="semester"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="1">1학기</option>
                <option value="2">2학기</option>
              </DropDown>
            </>
          )}
          {selectedType === "counseling" && (
            <>
              <SearchBox>
                <input
                  type="text"
                  placeholder="상담 제목 검색"
                  value={counselingQuery}
                  onChange={(e) => setCounselingQuery(e.target.value)}
                />
                <SearchButton onClick={fetchCounselingByTitle}>
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
              </SearchBox>
            </>
          )}

          {selectedType === "feedback" && (
            <DropDown
              id="grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </DropDown>
          )}
        </DropdownBox>
        <ButtonArea>
          <ToggleWrapper
            onClick={() => {
              setIsExcel(!isExcel);
            }}
          >
            <ToggleButton $isExcel={isExcel} />
            <OptionButton $isActive={isExcel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M17.1326 13.4313L7.44727 11.7251V24.333C7.44715 24.47 7.47408 24.6057 7.52653 24.7323C7.57897 24.8589 7.65588 24.9739 7.75286 25.0707C7.84984 25.1676 7.96497 25.2443 8.09166 25.2965C8.21835 25.3487 8.35411 25.3754 8.49114 25.3751H25.2036C25.3408 25.3757 25.4768 25.3491 25.6037 25.297C25.7305 25.2449 25.8459 25.1682 25.9431 25.0714C26.0402 24.9745 26.1173 24.8594 26.1698 24.7327C26.2224 24.606 26.2494 24.4702 26.2493 24.333V19.6876L17.1326 13.4313Z"
                  fill="#185C37"
                />
                <path
                  d="M17.1326 2.625H8.49114C8.35411 2.62466 8.21835 2.65136 8.09166 2.70359C7.96497 2.75582 7.84984 2.83254 7.75286 2.92936C7.65588 3.02617 7.57897 3.14118 7.52653 3.26778C7.47408 3.39439 7.44715 3.53009 7.44727 3.66713V8.3125L17.1326 14L22.261 15.7063L26.2493 14V8.3125L17.1326 2.625Z"
                  fill="#21A366"
                />
                <path
                  d="M7.44727 8.3125H17.1326V14H7.44727V8.3125Z"
                  fill="#107C41"
                />
                <path
                  opacity="0.1"
                  d="M14.379 7.17505H7.44727V21.3938H14.379C14.6552 21.3924 14.9198 21.2823 15.1153 21.0872C15.3109 20.8921 15.4217 20.6279 15.4238 20.3517V8.21717C15.4217 7.94097 15.3109 7.67671 15.1153 7.48164C14.9198 7.28658 14.6552 7.17642 14.379 7.17505Z"
                  fill="black"
                />
                <path
                  opacity="0.2"
                  d="M13.8094 7.74365H7.44727V21.9624H13.8094C14.0856 21.961 14.3501 21.8509 14.5457 21.6558C14.7413 21.4607 14.8521 21.1965 14.8541 20.9203V8.78578C14.8521 8.50957 14.7413 8.24531 14.5457 8.05024C14.3501 7.85518 14.0856 7.74503 13.8094 7.74365Z"
                  fill="black"
                />
                <path
                  opacity="0.2"
                  d="M13.8094 7.74365H7.44727V20.8249H13.8094C14.0856 20.8235 14.3501 20.7134 14.5457 20.5183C14.7413 20.3232 14.8521 20.059 14.8541 19.7828V8.78578C14.8521 8.50957 14.7413 8.24531 14.5457 8.05024C14.3501 7.85518 14.0856 7.74503 13.8094 7.74365Z"
                  fill="black"
                />
                <path
                  opacity="0.2"
                  d="M13.2398 7.74365H7.44727V20.8249H13.2398C13.516 20.8235 13.7805 20.7134 13.9761 20.5183C14.1716 20.3232 14.2824 20.059 14.2845 19.7828V8.78578C14.2824 8.50957 14.1716 8.24531 13.9761 8.05024C13.7805 7.85518 13.516 7.74503 13.2398 7.74365Z"
                  fill="black"
                />
                <path
                  d="M2.79475 7.74366H13.2405C13.5172 7.74343 13.7827 7.85306 13.9786 8.04847C14.1745 8.24388 14.2848 8.50908 14.2852 8.78578V19.214C14.2848 19.4907 14.1745 19.7559 13.9786 19.9513C13.7827 20.1468 13.5172 20.2564 13.2405 20.2562H2.79475C2.65764 20.2566 2.5218 20.23 2.395 20.1778C2.26821 20.1256 2.15297 20.0489 2.0559 19.9521C1.95883 19.8553 1.88184 19.7402 1.82934 19.6136C1.77685 19.4869 1.74988 19.3511 1.75 19.214V8.78578C1.74988 8.64868 1.77685 8.51289 1.82934 8.38623C1.88184 8.25957 1.95883 8.14453 2.0559 8.0477C2.15297 7.95087 2.26821 7.87417 2.395 7.82199C2.5218 7.76982 2.65764 7.7432 2.79475 7.74366Z"
                  fill="url(#paint0_linear_503_6178)"
                />
                <path
                  d="M4.98828 17.3888L7.18541 13.9903L5.17291 10.6111H6.78903L7.88716 12.775C7.98866 12.9797 8.06216 13.132 8.09541 13.2335H8.11028C8.18203 13.0695 8.25786 12.9103 8.33778 12.7557L9.51203 10.6146H10.9995L8.93541 13.9746L11.052 17.3915H9.46916L8.20041 15.0193C8.14166 14.9173 8.09161 14.8104 8.05078 14.7H8.02978C7.9927 14.8076 7.94338 14.9107 7.88278 15.0071L6.57641 17.3888H4.98828Z"
                  fill="white"
                />
                <path
                  d="M25.2047 2.62501H17.1328V8.31251H26.2494V3.66713C26.2496 3.53002 26.2226 3.39424 26.1701 3.26758C26.1176 3.14092 26.0406 3.02588 25.9435 2.92905C25.8465 2.83222 25.7312 2.75552 25.6044 2.70334C25.4776 2.65117 25.3418 2.62454 25.2047 2.62501Z"
                  fill="#33C481"
                />
                <path
                  d="M17.1328 14H26.2494V19.6875H17.1328V14Z"
                  fill="#107C41"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_503_6178"
                    x1="3.93225"
                    y1="6.92466"
                    x2="12.103"
                    y2="21.0752"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#18884F" />
                    <stop offset="0.5" stop-color="#117E43" />
                    <stop offset="1" stop-color="#0B6631" />
                  </linearGradient>
                </defs>
              </svg>
              Excel
            </OptionButton>
            <OptionButton $isActive={!isExcel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M15.166 10.4999H21.5827L15.166 4.08325V10.4999ZM6.99935 2.33325H16.3327L23.3327 9.33325V23.3333C23.3327 23.9521 23.0868 24.5456 22.6493 24.9832C22.2117 25.4208 21.6182 25.6666 20.9993 25.6666H6.99935C6.38051 25.6666 5.78702 25.4208 5.34943 24.9832C4.91185 24.5456 4.66602 23.9521 4.66602 23.3333V4.66659C4.66602 4.04775 4.91185 3.45425 5.34943 3.01667C5.78702 2.57908 6.38051 2.33325 6.99935 2.33325ZM12.751 14.5133C13.2293 15.5633 13.836 16.4266 14.536 17.0216L15.0143 17.3949C13.9993 17.5816 12.5993 17.9083 11.1177 18.4799L10.9893 18.5266L11.5727 17.3133C12.0977 16.2983 12.4827 15.3766 12.751 14.5133ZM20.311 18.9583C20.521 18.7483 20.626 18.4799 20.6377 18.1883C20.6727 17.9549 20.6143 17.7333 20.4977 17.5466C20.1593 16.9983 19.2843 16.7416 17.8377 16.7416L16.3327 16.8233L15.3177 16.1466C14.5827 15.5399 13.9177 14.4783 13.451 13.1599L13.4977 12.9966C13.8827 11.4449 14.2443 9.56659 13.4743 8.79659C13.3802 8.70513 13.2688 8.63329 13.1466 8.58522C13.0244 8.53716 12.8939 8.51383 12.7627 8.51659H12.4827C12.051 8.51659 11.666 8.97159 11.561 9.41492C11.1293 10.9666 11.386 11.8183 11.8177 13.2299V13.2416C11.526 14.2683 11.1527 15.4583 10.5577 16.6599L9.43768 18.7599L8.39935 19.3316C6.99935 20.2066 6.33435 21.1866 6.20602 21.8049C6.15935 22.0266 6.18268 22.2249 6.26435 22.4349L6.29935 22.4933L6.85935 22.8549L7.37268 22.9833C8.31768 22.9833 9.39102 21.8749 10.8377 19.4016L11.0477 19.3199C12.2493 18.9349 13.7427 18.6666 15.7493 18.4449C16.951 19.0399 18.3627 19.3083 19.2493 19.3083C19.7627 19.3083 20.1127 19.1799 20.311 18.9583ZM19.8327 18.1299L19.9377 18.2583C19.926 18.3749 19.891 18.3866 19.8327 18.4099H19.786L19.5643 18.4333C19.0277 18.4333 18.1993 18.2116 17.3477 17.8383C17.4527 17.7216 17.4993 17.7216 17.616 17.7216C19.2493 17.7216 19.716 18.0133 19.8327 18.1299ZM9.13435 19.8333C8.37602 21.2216 7.68768 21.9916 7.16268 22.1666C7.22102 21.7233 7.74602 20.9533 8.57435 20.1949L9.13435 19.8333ZM12.6577 11.7716C12.3893 10.7216 12.3777 9.86992 12.576 9.37992L12.6577 9.23992L12.8327 9.29825C13.031 9.57825 13.0543 9.95159 12.9377 10.5816L12.9027 10.7683L12.716 11.7249L12.6577 11.7716Z"
                  fill="#EF5350"
                />
              </svg>
              PDF
            </OptionButton>
          </ToggleWrapper>
          <SaveButton onClick={handleSave}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M19.9993 26.6667L11.666 18.3334L13.9993 15.9167L18.3327 20.2501V6.66675H21.666V20.2501L25.9993 15.9167L28.3327 18.3334L19.9993 26.6667ZM9.99935 33.3334C9.08268 33.3334 8.29824 33.0073 7.64602 32.3551C6.99379 31.7029 6.66713 30.9179 6.66602 30.0001V25.0001H9.99935V30.0001H29.9993V25.0001H33.3327V30.0001C33.3327 30.9167 33.0066 31.7017 32.3543 32.3551C31.7021 33.0084 30.9171 33.3345 29.9993 33.3334H9.99935Z"
                fill="black"
              />
            </svg>
          </SaveButton>
        </ButtonArea>
      </ControlContainer>
      {!selectedStudent ? (
        <GuideContainer>
          {" "}
          좌측의 검색창에서 보고서를 생성할 학생을 선택하세요.
        </GuideContainer>
      ) : (
        <ReportContainer ref={reportRef}>
          {selectedType === "score" && selectedStudent && (
            <ScoreReport
              student={selectedStudent}
              grade={selectedGrade}
              semester={selectedSemester}
              tableData={semesterTableData}
              chartData={radarSemesterData}
            />
          )}
          {selectedType === "counseling" &&
            !selectedCounseling &&
            counselingResults.length > 0 && (
              <CounselingSearchTable
                data={counselingResults}
                onSelect={(post) => {
                  setSelectedCounseling(post);
                  setCounselingQuery(post.title);
                }}
              />
            )}
          {selectedType === "counseling" &&
            selectedStudent &&
            selectedCounseling && (
              <CounselingReport
                student={selectedStudent}
                data={[selectedCounseling]}
              />
            )}
          {selectedType === "feedback" && selectedStudent && (
            <FeedBackReport
              student={selectedStudent}
              grade={selectedGrade}
              feedbacks={feedbacks}
            />
          )}
        </ReportContainer>
      )}
    </MainContainer>
  );
};
export default ReportPage;
