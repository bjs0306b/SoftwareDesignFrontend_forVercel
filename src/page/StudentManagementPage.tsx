import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { useStudentStore } from "../stores/studentStore";

import {
  StudentManagementContainer,
  StudentManagementHeader,
  Line,
  BasicInfoSection,
  InfoRow,
  InfoContent,
  InfoLabel,
  InfoInput,
  UpdateButton,
  SemesterAttendanceSection,
  SectionTitle,
  SectionNote,
  AttendanceTableWrapper,
  AttendanceTable,
  AttendanceHeaderCell,
  AttendanceCell,
  StudentAttendanceSection,
  AttendanceSummaryTable,
  AttendanceEditButton,
  SummaryHeaderCell,
  SummarySubHeaderCell,
  SummaryCell,
  SpecialNotesSection,
  NotesForm,
  EditButton,
  ClassAttendanceTableWrapper,
  ClassAttendanceTable,
  ClassAttendanceHeaderCell,
  ClassAttendanceCell,
  ClassAttendanceEditButton,
  ClassSectionTitle,
  GuideMessage,
} from "./StudentManagementPage.styled";

interface Student {
  studentId: number;
  name: string;
  grade: number;
  gradeClass: number;
  number: number;
  img: string;
}

interface AttendanceRecord {
  date: string;
  absent: string;
  late: string;
  early: string;
  partialAttendance: string;
}

interface AttendanceSummary {
  grade: string;
  totalDays: number;
  absentIllness: number;
  absentUnauthorized: number;
  absentOther: number;
  lateIllness: number;
  lateUnauthorized: number;
  lateOther: number;
  earlyIllness: number;
  earlyUnauthorized: number;
  earlyOther: number;
  partialAttendanceIllness: number;
  partialAttendanceUnauthorized: number;
  partialAttendanceOther: number;
}

interface ClassAttendanceRecord {
  studentId: number;
  absent: string;
  late: string;
  early: string;
  partialAttendance: string;
}

const StudentManagementPage: React.FC = () => {
  const selectedStudent = useStudentStore((state) => state.selectedStudent);
  const schoolId = useAuthStore((state) => state.schoolId);
  const classId = useAuthStore((state) => state.classId);
  const setSelectedStudent = useStudentStore(
    (state) => state.setSelectedStudent
  );
  const role = useAuthStore((state) => state.role);
  const isHomeroom = useAuthStore((state) => state.isHomeroom);
  const classStudents = useAuthStore((state) => state.classStudents);

  // 학생 기본 정보 상태
  const [basicInfo, setBasicInfo] = useState({
    name: selectedStudent?.name || "",
    grade: selectedStudent?.grade || "",
    class: selectedStudent?.gradeClass || "",
    number: selectedStudent?.number || "",
  });

  // 상태관리
  const [specialNotes, setSpecialNotes] = useState(""); // 특기사항
  const [isSpecialNotesEditing, setIsSpecialNotesEditing] = useState(false); // 특기사항 편집
  const [isAttendanceEditing, setIsAttendanceEditing] = useState(false); // 개인 출석 편집
  const [isClassAttendanceEditing, setIsClassAttendanceEditing] =
    useState(false); // 담임 모드 출석 편집

  // 학기 출석 데이터
  const [semesterAttendance, setSemesterAttendance] = useState<
    AttendanceRecord[]
  >([]);
  // 학생 출결 정보 데이터
  const [attendanceSummaryData, setAttendanceSummaryData] = useState<
    AttendanceSummary[]
  >([]);
  // 반 출석 데이터
  const [classAttendance, setClassAttendance] = useState<
    ClassAttendanceRecord[]
  >([]);

  const semesterId = (() => {
    const m = new Date().getMonth() + 1;
    return m >= 3 && m < 9 ? 1 : 2;
  })();

  // 기본 정보 변경 핸들러
  const handleBasicInfoChange =
    (field: keyof typeof basicInfo) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBasicInfo({
        ...basicInfo,
        [field]: e.target.value,
      });
    };

  // 기본 정보 업데이트 API
  const handleUpdateBasicInfo = async () => {
    if (!selectedStudent) return;

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await axios.patch(
        `/api/v1/school/${schoolId}/students/${selectedStudent.studentId}`,
        {
          name: basicInfo.name,
          grade: Number(basicInfo.grade), // 숫자로 변환
          gradeClass: Number(basicInfo.class), // 기본정보 객체의 `class` → API의 `gradeClass`
          number: Number(basicInfo.number),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("학생 기본 정보 업데이트 응답:", response.data);

      // 업데이트된 데이터를 상태나 전역 스토어에도 반영
      const d = response.data.data;
      const updatedStudent: Student = {
        studentId: d.studentId,
        name: d.user.name,
        grade: d.grade,
        gradeClass: d.gradeClass,
        number: d.number,
        img: d.user.photo || "",
      };
      setSelectedStudent(updatedStudent);
    } catch (err) {
      console.error("기본 정보 업데이트 실패:", err);
    }
  };

  // 특기사항 변경 핸들러
  const handleSpecialNotesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSpecialNotes(e.target.value);
  };

  // 출석 정보 입력 핸들러 (반 출석)
  const handleAttendanceInput = (
    studentId: number,
    field: string,
    value: string
  ) => {
    // Validate input
    const isValid =
      ["1", "2", ""].includes(value) ||
      (value.startsWith("3(") && value.endsWith(")"));
    if (!isValid) {
      alert(
        "출석 값은 '1', '2', '3(임의의 문자열)' 또는 빈 문자열이어야 합니다."
      );
      return;
    }

    setClassAttendance(
      classAttendance.map((student) => {
        if (student.studentId === studentId) {
          return {
            ...student,
            [field]: value,
          };
        }
        return student;
      })
    );
  };

  // 편집 모드 토글 핸들러
  const toggleSpecialNotesEditMode = async () => {
    if (isSpecialNotesEditing && selectedStudent) {
      // Save changes when exiting edit mode
      await handleSpecialNotesOperation();
    }
    setIsSpecialNotesEditing(!isSpecialNotesEditing);
  };
  const toggleAttendanceEditMode = () => {
    if (isAttendanceEditing) {
      saveSemesterAttendance(); // 저장
    } else {
      setIsAttendanceEditing(true); // 수정 모드로 진입
    }
  };
  const toggleClassAttendanceEditMode = async () => {
    if (isClassAttendanceEditing) {
      // Save changes when exiting edit mode
      await handleClassAttendanceOperation();
    }
    setIsClassAttendanceEditing(!isClassAttendanceEditing);
  };

  // 출석 정보 입력 핸들러 (학기 출석)
  const handleSemesterAttendanceInput = (
    date: string,
    field: keyof AttendanceRecord,
    rawValue: string
  ) => {
    // 앞뒤 공백을 없애고
    const value = rawValue.trim();
    // 유효성 검증
    const isValid =
      value === "" ||
      value === "1" ||
      value === "2" ||
      (value.startsWith("3(") && value.endsWith(")"));
    if (!isValid) {
      alert(
        "출석 값은 '1', '2', '3(임의의 문자열)' 또는 빈 문자열이어야 합니다."
      );
      return;
    }

    // 함수형으로 이전 상태를 안전하게 참조해서 업데이트
    setSemesterAttendance((prev) =>
      prev.map((rec) => (rec.date === date ? { ...rec, [field]: value } : rec))
    );

    console.log(semesterAttendance);
  };

  // API: 특정 학생 학기 출석 조회 함수
  const fetchSemesterAttendance = async (
    studentId: number,
    semesterId: number
  ): Promise<AttendanceRecord[]> => {
    const token = sessionStorage.getItem("accessToken");
    const response = await axios.get<{
      status: number;
      message: string;
      data: Array<{
        attendanceId: number;
        studentRecordId: number;
        date: string;
        type: "ABSENCE" | "LATE" | "EARLY" | "PARTIAL_ATTENDANCE";
        reason: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(
      `/api/v1/school/${schoolId}/student-record/attendance/students/${studentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { semester: semesterId },
      }
    );
    console.log("학기 출석 데이터", response.data.data);

    return response.data.data.map((rec) => ({
      date: rec.date,
      absent: rec.type === "ABSENCE" ? rec.reason : "",
      late: rec.type === "LATE" ? rec.reason : "",
      early: rec.type === "EARLY" ? rec.reason : "",
      partialAttendance: rec.type === "PARTIAL_ATTENDANCE" ? rec.reason : "",
    }));
  };

  // API: 특정 학생 학기 출석 작성/수정 함수
  const saveSemesterAttendance = async () => {
    if (!selectedStudent) return;

    // payload 만들기: 비어 있지 않은 항목만

    const attendancePayload = semesterAttendance
      .filter(
        (rec) => rec.absent || rec.late || rec.early || rec.partialAttendance
      )
      .map((rec) => {
        if (rec.absent) {
          return { date: rec.date, type: "ABSENCE", reason: rec.absent };
        }
        if (rec.late) {
          return { date: rec.date, type: "LATE", reason: rec.late };
        }
        if (rec.early) {
          return { date: rec.date, type: "EARLY", reason: rec.early };
        }
        if (rec.partialAttendance) {
          return {
            date: rec.date,
            type: "PARTIAL_ATTENDANCE",
            reason: rec.partialAttendance,
          };
        }
        // 안전장치
        return null;
      })
      .filter(
        (item): item is { date: string; type: string; reason: string } => !!item
      );

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await axios.post<{
        status: number;
        message: string;
        data: Array<{
          attendanceId: number;
          studentRecordId: number;
          date: string;
          type: "ABSENCE" | "LATE" | "EARLY" | "PARTIAL_ATTENDANCE";
          reason: string;
          createdAt: string;
          updatedAt: string;
        }>;
      }>(
        `/api/v1/school/${schoolId}/student-record/attendance/students/${selectedStudent.studentId}`,
        {
          semester: semesterId,
          attendance: attendancePayload,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 서버 응답으로 돌아온 최신 데이터를 state에 반영
      const saved = response.data.data.map((rec) => ({
        date: rec.date,
        absent: rec.type === "ABSENCE" ? rec.reason : "",
        late: rec.type === "LATE" ? rec.reason : "",
        early: rec.type === "EARLY" ? rec.reason : "",
        partialAttendance: rec.type === "PARTIAL_ATTENDANCE" ? rec.reason : "",
      }));
      setSemesterAttendance(saved);
      setIsAttendanceEditing(false);
      const updatedSummary = await fetchAttendanceSummary(
        selectedStudent.studentId
      );

      // 기본으로 항상 보여줄 1·2·3학년 행
      const defaultSummaries: AttendanceSummary[] = [
        {
          grade: "1학년",
          totalDays: 240,
          absentIllness: 0,
          absentUnauthorized: 0,
          absentOther: 0,
          lateIllness: 0,
          lateUnauthorized: 0,
          lateOther: 0,
          earlyIllness: 0,
          earlyUnauthorized: 0,
          earlyOther: 0,
          partialAttendanceIllness: 0,
          partialAttendanceUnauthorized: 0,
          partialAttendanceOther: 0,
        },
        {
          grade: "2학년",
          totalDays: 240,
          absentIllness: 0,
          absentUnauthorized: 0,
          absentOther: 0,
          lateIllness: 0,
          lateUnauthorized: 0,
          lateOther: 0,
          earlyIllness: 0,
          earlyUnauthorized: 0,
          earlyOther: 0,
          partialAttendanceIllness: 0,
          partialAttendanceUnauthorized: 0,
          partialAttendanceOther: 0,
        },
        {
          grade: "3학년",
          totalDays: 240,
          absentIllness: 0,
          absentUnauthorized: 0,
          absentOther: 0,
          lateIllness: 0,
          lateUnauthorized: 0,
          lateOther: 0,
          earlyIllness: 0,
          earlyUnauthorized: 0,
          earlyOther: 0,
          partialAttendanceIllness: 0,
          partialAttendanceUnauthorized: 0,
          partialAttendanceOther: 0,
        },
      ];

      const mergedSummaries = defaultSummaries.map(
        (def) => updatedSummary.find((u) => u.grade === def.grade) ?? def
      );

      setAttendanceSummaryData(mergedSummaries);
    } catch (err) {
      console.error("출석 정보 저장/수정 실패:", err);
      alert("출석 정보 저장 중 오류가 발생했습니다.");
    }
  };

  // API: 학생 출결 정보 함수
  const fetchAttendanceSummary = async (
    studentId: number
  ): Promise<AttendanceSummary[]> => {
    // 토큰 획득
    const token = sessionStorage.getItem("accessToken");

    // GET /api/v1/school/:schoolId/student-record/attendance-stats/students/:studentId
    const response = await axios.get<{
      status: number;
      message: string;
      data: Record<
        string,
        {
          ABSENCE?: Record<"무단" | "질병" | "기타", number>;
          LATE?: Record<"무단" | "질병" | "기타", number>;
          EARLY?: Record<"무단" | "질병" | "기타", number>;
          PARTIAL_ATTENDANCE?: Record<"무단" | "질병" | "기타", number>;
        }
      >;
    }>(
      `/api/v1/school/${schoolId}/student-record/attendance-stats/students/${studentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const raw = response.data.data;
    console.log("학생 출결 정보:", raw);
    const summaries: AttendanceSummary[] = Object.entries(raw).map(
      ([gradeStr, types]) => ({
        grade: `${gradeStr}학년`,
        totalDays: 240, // 필요에 따라 변경
        absentIllness: types.ABSENCE?.질병 ?? 0,
        absentUnauthorized: types.ABSENCE?.무단 ?? 0,
        absentOther: types.ABSENCE?.기타 ?? 0,
        lateIllness: types.LATE?.질병 ?? 0,
        lateUnauthorized: types.LATE?.무단 ?? 0,
        lateOther: types.LATE?.기타 ?? 0,
        earlyIllness: types.EARLY?.질병 ?? 0,
        earlyUnauthorized: types.EARLY?.무단 ?? 0,
        earlyOther: types.EARLY?.기타 ?? 0,
        partialAttendanceIllness: types.PARTIAL_ATTENDANCE?.질병 ?? 0,
        partialAttendanceUnauthorized: types.PARTIAL_ATTENDANCE?.무단 ?? 0,
        partialAttendanceOther: types.PARTIAL_ATTENDANCE?.기타 ?? 0,
      })
    );

    return summaries;
  };

  // API: 특기사항 조회
  const fetchSpecialNotes = async (
    studentId: number,
    semester: number
  ): Promise<string> => {
    const token = sessionStorage.getItem("accessToken");
    const response = await axios.get<{
      status: number;
      message: string;
      data: {
        grade: number;
        semester: number;
        extraInfo: string;
      };
    }>(
      `/api/v1/school/${schoolId}/student-record/extra-info/students/${studentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { semester },
      }
    );
    return response.data.data.extraInfo;
  };

  // API: 특기사항 작성/수정
  const saveSpecialNotes = async (
    studentId: number,
    semester: number,
    extraInfo: string
  ): Promise<string> => {
    const token = sessionStorage.getItem("accessToken");
    const response = await axios.post<{
      status: number;
      message: string;
      data: {
        studentRecordId: number;
        studentId: number;
        grade: number;
        semester: number;
        extraInfo: string;
        createdAt: string;
        updatedAt: string;
      };
    }>(
      `/api/v1/school/${schoolId}/student-record/extra-info/students/${studentId}`,
      {
        semester,
        extraInfo,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data.extraInfo;
  };

  // API: 반 출석 조회 함수
  const fetchClassAttendance = async (
    classId: number,
    date: string
  ): Promise<ClassAttendanceRecord[]> => {
    const token = sessionStorage.getItem("accessToken");
    const response = await axios.get<{
      status: number;
      message: string;
      data: Array<{
        date: string;
        type: "ABSENCE" | "LATE" | "EARLY" | "PARTIAL_ATTENDANCE";
        reason: string;
        studentRecord: {
          studentId: number;
          student: {
            classId: number;
          };
        };
      }>;
    }>(
      `/api/v1/school/${schoolId}/student-record/attendance/class/${classId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: date },
      }
    );

    console.log("반 출석 조회 데이터 :", response.data);

    // UI 에 필요한 형태로 변환
    return response.data.data.map((item) => ({
      studentId: item.studentRecord.studentId,
      absent: item.type === "ABSENCE" ? item.reason : "",
      late: item.type === "LATE" ? item.reason : "",
      early: item.type === "EARLY" ? item.reason : "",
      partialAttendance: item.type === "PARTIAL_ATTENDANCE" ? item.reason : "",
    }));
  };

  // API : 반 출석 작성/수정 함수
  const saveClassAttendance = async (
    classId: number,
    semester: number,
    date: string,
    attendanceList: {
      studentId: number;
      type: "ABSENCE" | "LATE" | "EARLY" | "PARTIAL_ATTENDANCE";
      reason: string;
    }[]
  ) => {
    const token = sessionStorage.getItem("accessToken");
    console.log("date : ", date);
    console.log("semester : ", semester);
    console.log("attendanceList : ", attendanceList);
    const response = await axios.post<{
      status: number;
      message: string;
      data: Array<{
        attendanceId: number;
        studentRecordId: number;
        studentRecord: { studentId: number };
        date: string;
        type: "ABSENCE" | "LATE" | "EARLY" | "PARTIAL_ATTENDANCE";
        reason: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(
      `/api/v1/school/${schoolId}/student-record/attendance/class/${classId}`,
      {
        date,
        semester,
        attendance: attendanceList,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("반 출석 작성/수정 응답:", response.data);
    return response.data.data;
  };

  // Handle special notes operation (create or update)
  const handleSpecialNotesOperation = async () => {
    if (!selectedStudent) return;

    const info = await saveSpecialNotes(
      selectedStudent.studentId,
      semesterId,
      specialNotes
    );
    setSpecialNotes(info);
    setIsSpecialNotesEditing(false);
  };

  const handleClassAttendanceOperation = async () => {
    try {
      const formattedDate = formatDateForApi(today);

      console.log("classAttendnace : ", classAttendance);
      const payload = classAttendance
        .filter(
          (rec) =>
            rec.absent !== "" ||
            rec.late !== "" ||
            rec.early !== "" ||
            rec.partialAttendance !== ""
        )
        .map((rec) => ({
          studentId: rec.studentId,
          type: rec.absent
            ? ("ABSENCE" as const)
            : rec.late
              ? ("LATE" as const)
              : rec.early
                ? ("EARLY" as const)
                : ("PARTIAL_ATTENDANCE" as const),
          reason: rec.absent || rec.late || rec.early || rec.partialAttendance,
        }));
      console.log("payload :", payload);

      if (payload.length === 0) {
        alert("입력된 출석 정보가 없습니다.");
        return;
      }

      const savedData = await saveClassAttendance(
        classId,
        semesterId,
        formattedDate,
        payload
      );
      console.log("반 출석 작성/수정 :", savedData);

      const newClassAttendance: ClassAttendanceRecord[] = savedData.map(
        (item) => ({
          studentId: item.studentRecord.studentId,
          absent: item.type === "ABSENCE" ? item.reason : "",
          late: item.type === "LATE" ? item.reason : "",
          early: item.type === "EARLY" ? item.reason : "",
          partialAttendance:
            item.type === "PARTIAL_ATTENDANCE" ? item.reason : "",
        })
      );
      setClassAttendance(newClassAttendance);

      alert("반 출석 정보가 저장되었습니다.");
      setIsClassAttendanceEditing(false);
    } catch (error) {
      console.error("Error saving class attendance:", error);
      alert("반 출석 정보 저장 중 오류가 발생했습니다.");
    }
  };

  const formatDateForApi = (date: Date): string => {
    const month = date.getMonth() + 1; // 1부터 시작
    const day = date.getDate(); // 1부터 시작
    return `${month}/${day}`;
  };

  useEffect(() => {
    // 1) 학생 데이터 로드
    if (selectedStudent) {
      // 기본 정보 동기화
      setBasicInfo({
        name: selectedStudent.name || "",
        grade: selectedStudent.grade || "",
        class: selectedStudent.gradeClass || "",
        number: selectedStudent.number || "",
      });

      const baseRecords: AttendanceRecord[] = semesterDates.map((date) => ({
        date,
        absent: "",
        late: "",
        early: "",
        partialAttendance: "",
      }));

      const loadStudentData = async () => {
        try {
          // a) 해당 학기 출석 조회
          const fetched = await fetchSemesterAttendance(
            selectedStudent.studentId,
            semesterId
          );
          const merged = baseRecords.map((rec) => {
            const found = fetched.find((f) => f.date === rec.date);
            return found || rec;
          });
          setSemesterAttendance(merged);

          // b) 출결 요약 조회
          const rawSummary = await fetchAttendanceSummary(
            selectedStudent.studentId
          );

          const completeSummary: AttendanceSummary[] = [1, 2, 3].map((g) => {
            const found = rawSummary.find((s) => s.grade === `${g}학년`);
            return (
              found || {
                grade: `${g}학년`,
                totalDays: 240,
                absentIllness: 0,
                absentUnauthorized: 0,
                absentOther: 0,
                lateIllness: 0,
                lateUnauthorized: 0,
                lateOther: 0,
                earlyIllness: 0,
                earlyUnauthorized: 0,
                earlyOther: 0,
                partialAttendanceIllness: 0,
                partialAttendanceUnauthorized: 0,
                partialAttendanceOther: 0,
              }
            );
          });

          setAttendanceSummaryData(completeSummary);

          // c) 특기사항 조회
          const notesResponse = await fetchSpecialNotes(
            selectedStudent.studentId,
            semesterId
          );
          setSpecialNotes(notesResponse || "");
        } catch (error) {
          // 에러 시 기본값 초기화
          console.error("학기 출석 불러오기 실패", error);

          setSemesterAttendance(baseRecords);

          setAttendanceSummaryData(
            [1, 2, 3].map((g) => ({
              grade: `${g}학년`,
              totalDays: 240,
              absentIllness: 0,
              absentUnauthorized: 0,
              absentOther: 0,
              lateIllness: 0,
              lateUnauthorized: 0,
              lateOther: 0,
              earlyIllness: 0,
              earlyUnauthorized: 0,
              earlyOther: 0,
              partialAttendanceIllness: 0,
              partialAttendanceUnauthorized: 0,
              partialAttendanceOther: 0,
            }))
          );
          setSpecialNotes("");
        }
      };

      loadStudentData();
    }

    // 2) 담임 모드일 때 반 출석 조회
    if (isHomeroom) {
      // 반 학생 전원을 “빈 값”으로 먼저 세팅
      const blank: ClassAttendanceRecord[] = classStudents.map((stu) => ({
        studentId: stu.studentId,
        absent: "",
        late: "",
        early: "",
        partialAttendance: "",
      }));
      setClassAttendance(blank);

      // 서버에 오늘 날짜 출석 조회 → 받은 값으로 덮어쓰기(merge)
      const load = async () => {
        try {
          const today = formatDateForApi(new Date());
          const server = await fetchClassAttendance(classId, today);

          setClassAttendance((prev) =>
            prev.map(
              (rec) => server.find((s) => s.studentId === rec.studentId) ?? rec
            )
          );
        } catch (e) {
          console.error("반 출석 조회 실패", e);
        }
      };

      load();
    }
  }, [selectedStudent, isHomeroom, classStudents]);

  // 현재 날짜 구하기
  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // 학기 출석 날짜
  // 학기별 평일 날짜 계산 (1학기: 3/2~7/30, 2학기: 9/1~12/30)
  const semesterDates = (() => {
    const year = new Date().getFullYear();
    const start =
      semesterId === 1
        ? new Date(year, 2, 2) // 3월 2일
        : new Date(year, 8, 1); // 9월 1일
    const end =
      semesterId === 1
        ? new Date(year, 6, 30) // 7월 30일
        : new Date(year, 11, 30); // 12월 30일

    const dates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      // 0=일요일, 6=토요일 제외
      if (day !== 0 && day !== 6) {
        dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
      }
    }
    return dates;
  })();

  const attendanceCategories = ["결석", "지각", "조퇴", "결과"];

  // 총계 계산
  const calculateTotals = () => {
    const totals = {
      absent: 0,
      late: 0,
      early: 0,
      partialAttendance: 0,
    };

    semesterAttendance.forEach((record) => {
      if (record.absent) totals.absent += 1;
      if (record.late) totals.late += 1;
      if (record.early) totals.early += 1;
      if (record.partialAttendance) totals.partialAttendance += 1;
    });

    return totals;
  };

  const totals = calculateTotals();

  return (
    <StudentManagementContainer>
      <StudentManagementHeader data-testid="page-header">
        학생부 관리
      </StudentManagementHeader>
      <Line />
      {selectedStudent || !(role == "TEACHER") ? (
        <>
          {/* 학생 기본정보 수정 섹션 */}
          {role === "TEACHER" && (
            <BasicInfoSection>
              <SectionTitle>학생 기본정보 수정</SectionTitle>
              <InfoRow>
                <InfoContent>
                  <InfoLabel>이름</InfoLabel>
                  <InfoInput
                    data-testid="basicinfo-name-input"
                    type="text"
                    onChange={handleBasicInfoChange("name")}
                    value={basicInfo.name}
                  />
                  <InfoLabel>학년</InfoLabel>
                  <InfoInput
                    data-testid="basicinfo-grade-input"
                    type="text"
                    onChange={handleBasicInfoChange("grade")}
                    value={basicInfo.grade}
                  />
                  <InfoLabel>반</InfoLabel>
                  <InfoInput
                    data-testid="basicinfo-class-input"
                    type="text"
                    onChange={handleBasicInfoChange("class")}
                    value={basicInfo.class}
                  />
                  <InfoLabel>번호</InfoLabel>
                  <InfoInput
                    data-testid="basicinfo-number-input"
                    type="text"
                    onChange={handleBasicInfoChange("number")}
                    value={basicInfo.number}
                  />
                  <UpdateButton
                    data-testid="basicinfo-apply-button"
                    onClick={handleUpdateBasicInfo}
                  >
                    적용
                  </UpdateButton>
                </InfoContent>
              </InfoRow>
            </BasicInfoSection>
          )}

          {/* 해당 학기 출석 섹션 */}
          <SemesterAttendanceSection
            data-testid="semester-attendance-section"
            role={role}
          >
            <SectionTitle>
              해당 학기 출석
              <SectionNote>[1: 무단 2:질병 3:기타(사유)]</SectionNote>
            </SectionTitle>
            <AttendanceTableWrapper>
              <AttendanceTable data-testid="semester-attendance-table">
                <thead>
                  <tr>
                    <AttendanceHeaderCell></AttendanceHeaderCell>
                    <AttendanceHeaderCell>총</AttendanceHeaderCell>
                    {semesterDates.map((date) => (
                      <AttendanceHeaderCell key={date}>
                        {date}
                      </AttendanceHeaderCell>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendanceCategories.map((category) => (
                    <tr key={category} data-testid="semester-attendance-row">
                      <AttendanceHeaderCell>{category}</AttendanceHeaderCell>
                      <AttendanceCell
                        data-testid="semester-attendance-cell"
                        className="total"
                      >
                        {
                          totals[
                            category === "결석"
                              ? "absent"
                              : category === "지각"
                                ? "late"
                                : category === "조퇴"
                                  ? "early"
                                  : "partialAttendance"
                          ]
                        }
                      </AttendanceCell>
                      {semesterDates.map((date) => {
                        const record = semesterAttendance.find(
                          (r) => r.date === date
                        );
                        const field =
                          category === "결석"
                            ? "absent"
                            : category === "지각"
                              ? "late"
                              : category === "조퇴"
                                ? "early"
                                : "partialAttendance";
                        return (
                          <AttendanceCell
                            key={`${category}-${date}`}
                            data-testid="semester-attendance-cell"
                            contentEditable={isAttendanceEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleSemesterAttendanceInput(
                                date,
                                field,
                                e.currentTarget.textContent || ""
                              )
                            }
                          >
                            {record ? record[field] : ""}
                          </AttendanceCell>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </AttendanceTable>
            </AttendanceTableWrapper>
            {role === "TEACHER" && (
              <AttendanceEditButton
                data-testid="semester-attendance-button"
                onClick={toggleAttendanceEditMode}
              >
                {isAttendanceEditing ? "저장" : "수정"}
              </AttendanceEditButton>
            )}
          </SemesterAttendanceSection>

          {/* 출결 정보 테이블 */}
          <StudentAttendanceSection>
            <SectionTitle>학생 출결 정보</SectionTitle>
            <AttendanceSummaryTable data-testid="attendance-summary-table">
              <thead>
                <tr>
                  <SummaryHeaderCell rowSpan={2}>학년</SummaryHeaderCell>
                  <SummaryHeaderCell rowSpan={2}>수업일수</SummaryHeaderCell>
                  <SummaryHeaderCell colSpan={3}>결석일수</SummaryHeaderCell>
                  <SummaryHeaderCell colSpan={3}>지각</SummaryHeaderCell>
                  <SummaryHeaderCell colSpan={3}>조퇴</SummaryHeaderCell>
                  <SummaryHeaderCell colSpan={3}>결과</SummaryHeaderCell>
                </tr>
                <tr>
                  <SummarySubHeaderCell>무단</SummarySubHeaderCell>
                  <SummarySubHeaderCell>질병</SummarySubHeaderCell>
                  <SummarySubHeaderCell>기타</SummarySubHeaderCell>

                  <SummarySubHeaderCell>무단</SummarySubHeaderCell>
                  <SummarySubHeaderCell>질병</SummarySubHeaderCell>
                  <SummarySubHeaderCell>기타</SummarySubHeaderCell>

                  <SummarySubHeaderCell>무단</SummarySubHeaderCell>
                  <SummarySubHeaderCell>질병</SummarySubHeaderCell>
                  <SummarySubHeaderCell>기타</SummarySubHeaderCell>

                  <SummarySubHeaderCell>무단</SummarySubHeaderCell>
                  <SummarySubHeaderCell>질병</SummarySubHeaderCell>
                  <SummarySubHeaderCell>기타</SummarySubHeaderCell>
                </tr>
              </thead>
              <tbody>
                {attendanceSummaryData.map((row, rowIndex) => (
                  <tr key={rowIndex} data-testid="attendance-summary-row">
                    <SummaryCell data-testid="attendance-summary-grade-cell">
                      {row.grade}
                    </SummaryCell>
                    <SummaryCell data-testid="attendance-summary-total-cell">
                      {row.totalDays}
                    </SummaryCell>
                    {/* 결석 */}
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.absentUnauthorized}
                    </SummaryCell>{" "}
                    {/* 무단 */}
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.absentIllness}
                    </SummaryCell>{" "}
                    {/* 질병 */}
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.absentOther}
                    </SummaryCell>{" "}
                    {/* 기타 */}
                    {/* 지각 */}
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.lateUnauthorized}
                    </SummaryCell>
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.lateIllness}
                    </SummaryCell>
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.lateOther}
                    </SummaryCell>
                    {/* 조퇴 */}
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.earlyUnauthorized}
                    </SummaryCell>
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.earlyIllness}
                    </SummaryCell>
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.earlyOther}
                    </SummaryCell>
                    {/* 결과 */}
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.partialAttendanceUnauthorized}
                    </SummaryCell>
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.partialAttendanceIllness}
                    </SummaryCell>
                    <SummaryCell data-testid="attendance-summary-cell">
                      {row.partialAttendanceOther}
                    </SummaryCell>
                  </tr>
                ))}
              </tbody>
            </AttendanceSummaryTable>
          </StudentAttendanceSection>

          {/* 특기 사항 섹션 */}
          <SpecialNotesSection data-testid="specialnotes-section" role={role}>
            <SectionTitle>특기 사항</SectionTitle>
            <NotesForm
              data-testid="specialnotes-textarea"
              value={specialNotes}
              onChange={handleSpecialNotesChange}
              disabled={!isSpecialNotesEditing}
              placeholder={
                isSpecialNotesEditing ? "학생의 특기 사항을 입력하세요" : ""
              }
              role={role}
            />
            {role === "TEACHER" && (
              <EditButton
                data-testid="specialnotes-button"
                onClick={toggleSpecialNotesEditMode}
              >
                {isSpecialNotesEditing ? "저장" : "수정"}
              </EditButton>
            )}
          </SpecialNotesSection>
        </>
      ) : isHomeroom ? (
        <div>
          <ClassSectionTitle data-testid="class-section-title">
            {formattedDate} - 반 출석 관리
            <SectionNote>[1: 무단 2:질병 3:기타(사유)]</SectionNote>
          </ClassSectionTitle>
          

          {classStudents.length > 0 ? (
            <>
              <ClassAttendanceTableWrapper>
                <ClassAttendanceTable data-testid="class-attendance-table">
                  <thead>
                    <tr>
                      <ClassAttendanceHeaderCell>
                        번호
                      </ClassAttendanceHeaderCell>
                      <ClassAttendanceHeaderCell>
                        이름
                      </ClassAttendanceHeaderCell>
                      <ClassAttendanceHeaderCell>
                        결석
                      </ClassAttendanceHeaderCell>
                      <ClassAttendanceHeaderCell>
                        지각
                      </ClassAttendanceHeaderCell>
                      <ClassAttendanceHeaderCell>
                        조퇴
                      </ClassAttendanceHeaderCell>
                      <ClassAttendanceHeaderCell>
                        결과
                      </ClassAttendanceHeaderCell>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((stu) => {
                      const rec: ClassAttendanceRecord = classAttendance.find(
                        (r) => r.studentId === stu.studentId
                      ) ?? {
                        studentId: stu.studentId,
                        absent: "",
                        late: "",
                        early: "",
                        partialAttendance: "",
                      };
                      return (
                        <tr key={stu.studentId} data-testid="class-student-row">
                          <ClassAttendanceCell data-testid="class-attendance-cell-number">
                            {stu.number}
                          </ClassAttendanceCell>
                          <ClassAttendanceCell data-testid="class-attendance-cell-name">
                            {stu.name}
                          </ClassAttendanceCell>
                          <ClassAttendanceCell
                            data-testid="class-attendance-cell"
                            contentEditable={isClassAttendanceEditing}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAttendanceInput(
                                stu.studentId,
                                "absent",
                                e.currentTarget.textContent || ""
                              )
                            }
                          >
                            {rec.absent || ""}
                          </ClassAttendanceCell>
                          <ClassAttendanceCell
                            data-testid="class-attendance-cell"
                            contentEditable={isClassAttendanceEditing}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAttendanceInput(
                                stu.studentId,
                                "late",
                                e.currentTarget.textContent || ""
                              )
                            }
                          >
                            {rec.late || ""}
                          </ClassAttendanceCell>
                          <ClassAttendanceCell
                            data-testid="class-attendance-cell"
                            contentEditable={isClassAttendanceEditing}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAttendanceInput(
                                stu.studentId,
                                "early",
                                e.currentTarget.textContent || ""
                              )
                            }
                          >
                            {rec.early || ""}
                          </ClassAttendanceCell>
                          <ClassAttendanceCell
                            data-testid="class-attendance-cell"
                            contentEditable={isClassAttendanceEditing}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAttendanceInput(
                                stu.studentId,
                                "partialAttendance",
                                e.currentTarget.textContent || ""
                              )
                            }
                          >
                            {rec.partialAttendance || ""}
                          </ClassAttendanceCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </ClassAttendanceTable>
              </ClassAttendanceTableWrapper>

              <ClassAttendanceEditButton
                data-testid="edit-attendance-button"
                onClick={toggleClassAttendanceEditMode}
              >
                {isClassAttendanceEditing ? "저장" : "수정"}
              </ClassAttendanceEditButton>
            </>
          ) : (
            <GuideMessage data-testid="empty-message">
              반 학생 정보가 없습니다.
            </GuideMessage>
          )}
        </div>
      ) : (
        <GuideMessage>
          좌측 검색창에서 성적을 조회할 학생을 검색하세요.
        </GuideMessage>
      )}
    </StudentManagementContainer>
  );
};

export default StudentManagementPage;
