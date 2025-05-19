import React, { useCallback, useEffect, useState } from "react";
import RadarChart from "../components/RadarChart";
import { useAuthStore } from "../stores/authStore";
import { useStudentStore } from "../stores/studentStore";
import axios from "../api/axiosInstance";

import {
  MainContainer,
  DropDown,
  Line,
  ToggleWrapper,
  ToggleButton,
  OptionButton,
  GradeContainer,
  ChartArea,
  TableArea,
  GradeTable,
  ChartTitle,
  ChartBox,
  DropdownBox,
  ScoreInput,
  EditButton,
  CancleButton,
  SaveButton,
  ButtonArea,
  GuideMessage,
  StudentsTableArea,
  StudentGradeTable,
} from "./GradePage.styled";

interface GradeItem {
  subject?: string;
  semester?: string;
  score?: number;
}

interface StudentGrade {
  subject: string;
  score: number;
  schoolYear: number;
  semester: number;
  student: {
    studentId: number;
    user: {
      name: string;
    };
  };
  updatedAt?: string;
}

interface StudentInfo {
  studentId: number;
  name: string;
  number: number;
}

interface GroupedStudentAverage {
  name: string;
  scores: Record<string, number>;
  average: number | string;
}

const subjects = ["국어", "영어", "수학", "과학", "사회"];

const GradePage: React.FC = () => {
  const [isPeriod, setIsPeriod] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("1");
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [selectedSubject, setSelectedSubject] = useState("국어");
  const [isEditing, setIsEditing] = useState(false);

  const [studentGrades, setStudentGrades] = useState<GradeItem[]>([]);
  const [backupStudentGrades, setBackupStudentGrades] = useState<GradeItem[]>(
    []
  );
  const [initiallyFetchedGrades, setInitiallyFetchedGrades] = useState<
    StudentGrade[]
  >([]);
  const [classGrades, setClassGrades] = useState<StudentGrade[]>([]);
  const [classStudents, setClassStudents] = useState<StudentInfo[]>([]);

  const role = useAuthStore((state) => state.role);
  const isHomeroom = useAuthStore((state) => state.isHomeroom);
  const selectedStudent = useStudentStore((state) => state.selectedStudent);
  const schoolId = useAuthStore((state) => state.schoolId);

  const teacherGrade = useAuthStore((state) => state.grade);
  const teacherClass = useAuthStore((state) => state.gradeClass);

  const fetchClassStudents = useCallback(async () => {
    try {
      const classId = Number(sessionStorage.getItem("classId"));
      const response = await axios.get(
        `/school/${schoolId}/class/${classId}/students`
      );
      if (response.data.status === 200) {
        const data = response.data.data.map(
          (item: {
            studentId: number;
            number: number;
            user: { name: string };
          }) => ({
            studentId: item.studentId,
            name: item.user.name,
            number: item.number,
          })
        );
        data.sort((a: StudentInfo, b: StudentInfo) => a.number - b.number);
        setClassStudents(data);
      }
    } catch (err) {
      console.error("반 학생 조회 실패", err);
    }
  }, [schoolId]);

  const loadClassGrades = useCallback(async () => {
    try {
      const classId = Number(sessionStorage.getItem("classId"));
      const semester = `${selectedSemester}`;
      const response = await axios.get(
        `/school/${schoolId}/grades/class/${classId}?semester=${semester}`
      );
      setClassGrades(response.data.grades);
    } catch (err) {
      console.error("반 학생 성적 조회 실패", err);
    }
  }, [schoolId, selectedSemester]);

  const fetchStudentGrades = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      const response = await axios.get(
        `/school/${schoolId}/grades/students/${selectedStudent.studentId}`,
        isPeriod
          ? {
              params: { schoolYear: selectedGrade, semester: selectedSemester },
            }
          : { params: { subject: selectedSubject } }
      );
      const serverGrades = response.data.grades as StudentGrade[];
      setInitiallyFetchedGrades(serverGrades);

      if (isPeriod) {
        const merged = subjects.map((subject) => {
          const found = serverGrades.find((g) => g.subject === subject);
          return {
            subject,
            score: found?.score,
            updatedAt: found?.updatedAt,
          };
        });

        setStudentGrades(merged);
      } else {
        const semesterOrder = [
          { schoolYear: 1, semester: 1 },
          { schoolYear: 1, semester: 2 },
          { schoolYear: 2, semester: 1 },
          { schoolYear: 2, semester: 2 },
          { schoolYear: 3, semester: 1 },
          { schoolYear: 3, semester: 2 },
        ];
        const merged = semesterOrder.map(({ schoolYear, semester }) => {
          const found = serverGrades.find(
            (g) => g.schoolYear === schoolYear && g.semester === semester
          );
          return {
            semester: `${schoolYear}학년 ${semester}학기`,
            score: found?.score,
            updatedAt: found?.updatedAt,
          };
        });
        setStudentGrades(merged);
      }
    } catch (err) {
      console.error("성적 조회 실패", err);
    }
  }, [
    selectedGrade,
    selectedSemester,
    selectedSubject,
    isPeriod,
    selectedStudent,
    schoolId,
  ]);

  //반 학생 목록 요청
  useEffect(() => {
    if (isHomeroom && !selectedStudent) {
      fetchClassStudents();
    }
  }, [isHomeroom, selectedStudent, fetchClassStudents]);

  //반 학생 성적 요청
  useEffect(() => {
    if (isHomeroom && !selectedStudent && classStudents.length > 0) {
      loadClassGrades();
    }
  }, [isHomeroom, selectedStudent, classStudents, loadClassGrades]);

  const groupedByStudent = classStudents.reduce(
    (acc: Record<number, GroupedStudentAverage>, student) => {
      const scores: Record<string, number> = {};
      let sum = 0;
      let count = 0;
      classGrades.forEach((grade) => {
        if (grade.student.studentId === student.studentId) {
          scores[grade.subject] = grade.score;
          sum += grade.score;
          count++;
        }
      });
      const average = count > 0 ? parseFloat((sum / count).toFixed(1)) : "-";
      acc[student.studentId] = { name: student.name, scores, average };
      return acc;
    },
    {}
  );

  useEffect(() => {
    if (selectedStudent) fetchStudentGrades();
  }, [selectedStudent, fetchStudentGrades]);

  const handleEdit = () => {
    setBackupStudentGrades(JSON.parse(JSON.stringify(studentGrades)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setStudentGrades(backupStudentGrades);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedStudent) return;

    const patchPayload = [];
    const postPayload = [];

    for (const g of studentGrades) {
      if (isPeriod) {
        const found = initiallyFetchedGrades.find(
          (f) => f.subject === g.subject
        );
        if (found) {
          if (found.score !== g.score && g.score !== undefined) {
            patchPayload.push({
              subject: g.subject!,
              schoolYear: Number(selectedGrade),
              semester: Number(selectedSemester),
              score: Number(g.score),
              updatedAt: found.updatedAt,
            });
          }
        } else {
          if (g.score !== undefined) {
            postPayload.push({
              subject: g.subject!,
              schoolYear: Number(selectedGrade),
              semester: Number(selectedSemester),
              score: Number(g.score),
            });
          }
        }
      } else {
        const found = initiallyFetchedGrades.find(
          (f) =>
            f.subject === selectedSubject &&
            f.schoolYear === Number(g.semester?.[0]) &&
            f.semester === Number(g.semester?.[4])
        );
        if (found) {
          if (found.score !== g.score && g.score !== undefined) {
            patchPayload.push({
              subject: selectedSubject,
              schoolYear: Number(g.semester?.[0]),
              semester: Number(g.semester?.[4]),
              score: Number(g.score),
            });
          }
        } else {
          if (g.score !== undefined) {
            postPayload.push({
              subject: selectedSubject,
              schoolYear: Number(g.semester?.[0]),
              semester: Number(g.semester?.[4]),
              score: Number(g.score),
            });
          }
        }
      }
    }

    try {
      if (postPayload.length > 0) {
        await axios.post(
          `/school/${schoolId}/grades/students/${selectedStudent.studentId}`,
          postPayload
        );
      }
      if (patchPayload.length > 0) {
        await axios.patch(
          `/school/${schoolId}/grades/students/${selectedStudent.studentId}`,
          patchPayload
        );
      }
      alert("성적 저장 완료");
      setIsEditing(false);
      fetchStudentGrades();
    } catch (err) {
      console.error("성적 저장 실패", err);
      alert("성적 저장 실패");
    }
  };

  const handleScoreChange = (idx: number, value: string) => {
    const updated = [...studentGrades];
    updated[idx].score = value === "" ? undefined : Number(value);
    setStudentGrades(updated);
  };

  const radarSemesterData: { name: string; value: number }[] =
    studentGrades.map((g) => ({
      name: (isPeriod ? g.subject : g.semester) ?? "N/A",
      value: g.score === undefined ? 0 : Number(g.score),
    }));

  if (role === "TEACHER" && !isHomeroom && !selectedStudent) {
    return (
      <MainContainer>
        <h1>학생성적관리</h1>
        <Line />
        <GuideMessage data-testid="grade-guide-message">
          좌측 검색창에서 성적을 조회할 학생을 검색하세요.
        </GuideMessage>
      </MainContainer>
    );
  }

  if (role === "TEACHER" && isHomeroom && !selectedStudent) {
    return (
      <MainContainer>
        <h1>학생성적관리</h1>
        <Line />
        <GradeContainer>
          <StudentsTableArea>
            <h2>{`${new Date().getFullYear()}학년도 ${selectedSemester}학기 성적 - ${teacherGrade}학년 ${teacherClass}반`}</h2>
            <StudentGradeTable data-testid="class-grade-table">
              <table>
                <thead>
                  <tr>
                    <th>이름</th>
                    {subjects.map((subj) => (
                      <th key={subj}>{subj}</th>
                    ))}
                    <th>평균</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student) => {
                    const data = groupedByStudent[student.studentId];
                    return (
                      <tr key={student.studentId} data-testid="class-grade-row">
                        <td>{data?.name ?? student.name}</td>
                        {subjects.map((subject, idx) => (
                          <td key={idx}>{data?.scores[subject] ?? "-"}</td>
                        ))}
                        <td>{data?.average ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </StudentGradeTable>
          </StudentsTableArea>
        </GradeContainer>
      </MainContainer>
    );
  }
  return (
    <MainContainer>
      <h1>학생성적관리</h1>
      <Line />
      <GradeContainer>
        <TableArea>
          <ToggleWrapper onClick={() => !isEditing && setIsPeriod(!isPeriod)}>
            <ToggleButton $isPeriod={isPeriod} />
            <OptionButton $isActive={isPeriod}>기간별</OptionButton>
            <OptionButton $isActive={!isPeriod}>과목별</OptionButton>
          </ToggleWrapper>
          <DropdownBox>
            {isPeriod ? (
              <>
                <DropDown
                  data-testid="grade-select"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  disabled={isEditing}
                >
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </DropDown>
                <DropDown
                  data-testid="semester-select"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  disabled={isEditing}
                  id="semester"
                >
                  <option value="1">1학기</option>
                  <option value="2">2학기</option>
                </DropDown>
              </>
            ) : (
              <DropDown
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={isEditing}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </DropDown>
            )}
          </DropdownBox>
          <GradeTable data-testid="period-grade-table">
            <table>
              <thead>
                <tr>
                  <th>{isPeriod ? "과목" : "학기"}</th>
                  <th>성적</th>
                  <th>등급</th>
                </tr>
              </thead>
              <tbody data-testid="period-grade-rows">
                {studentGrades.map((g, idx) => (
                  <tr key={idx} data-testid={`period-grade-row-${idx}`}>
                    <td>{isPeriod ? g.subject : g.semester}</td>
                    <td>
                      {isEditing ? (
                        <ScoreInput
                          data-testid={`period-score-input-${idx}`}
                          type="number"
                          value={g.score === undefined ? "" : g.score}
                          onChange={(e) =>
                            handleScoreChange(idx, e.target.value)
                          }
                        />
                      ) : (
                        <span data-testid={`period-score-text-${idx}`}>
                          {g.score}
                        </span>
                      )}
                    </td>
                    <td>
                      {g.score !== undefined
                        ? Math.ceil((100 - Number(g.score)) / 10)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GradeTable>
          {role !== "STUDENT" && (
            <ButtonArea>
              {isEditing ? (
                <>
                  <CancleButton
                    data-testid="grade-cancel-button"
                    onClick={handleCancel}
                  >
                    수정 취소
                  </CancleButton>
                  <SaveButton
                    data-testid="grade-save-button"
                    onClick={handleSave}
                  >
                    수정 완료
                  </SaveButton>
                </>
              ) : (
                <EditButton
                  data-testid="grade-edit-button"
                  onClick={handleEdit}
                >
                  성적관리
                </EditButton>
              )}
            </ButtonArea>
          )}
        </TableArea>
        <ChartArea>
          <ChartTitle data-testid="grade-chart-title">
            {isPeriod
              ? `${selectedGrade}학년 ${selectedSemester}학기 통계`
              : `${selectedSubject} 성적 통계`}
          </ChartTitle>
          <ChartBox data-testid="grade-chart-box">
            <RadarChart data={radarSemesterData} />
          </ChartBox>
        </ChartArea>
      </GradeContainer>
    </MainContainer>
  );
};

export default GradePage;
