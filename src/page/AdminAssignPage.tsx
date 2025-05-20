import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  PageWrapper,
  ClassListWrapper,
  ClassItem,
  ClassTitle,
  MainWrapper,
  Header,
  StudentTable,
  AssignButton,
  ListRow,
  ScrollBox,
  SaveButton,
  DropdownRow,
  CategorySelect,
  TableSearchInput,
  ClassListScroll,
  ModalBackdrop,
  ModalBox,
  ModalRow,
  ModalNumberInput,
  ModalActionRow,
  ModalBtn,
  ResetButton,
} from "./AdminAssignPage.styled";
import { useAuthStore } from "../stores/authStore";

const mapStudent = (
  raw: any,
  fallbackClassId: number | null = null
): StudentInfo => ({
  studentId: raw.studentId,
  name: raw.user?.name ?? "",
  number: 0,
  classId: raw.classId ?? fallbackClassId,
});

const mapTeacher = (raw: any): TeacherInfo => ({
  teacherId: raw.teacherId,
  subject: raw.subject,
  name: raw.user?.name ?? "",
});

// 학생 배열을 이름순(한글)으로 정렬하고 1번부터 번호 부여
const sortAndNumber = (list: StudentInfo[]): StudentInfo[] =>
  list
    .slice() // 원본 보호
    .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"))
    .map((s, idx) => ({ ...s, number: idx + 1 }));

interface ClassInfo {
  classId: number;
  grade: number;
  gradeClass: number;
}

interface StudentInfo {
  studentId: number;
  number: number | null;
  name: string;
  classId: number | null;
}

interface TeacherInfo {
  teacherId: number;
  subject: string;
  name: string;
}

const AdminAssignPage: React.FC = () => {
  const schoolId = useAuthStore((s) => s.schoolId); // schoolId 가져오기

  const [classes, setClasses] = useState<ClassInfo[]>([]); // 학급 목록
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null); // 선택된 학급
  const [students, setStudents] = useState<StudentInfo[]>([]); // 현재 학생 목록
  const [candidateStudents, setCandidateStudents] = useState<StudentInfo[]>([]); // 추가 가능한 학생 목록
  const [homeroom, setHomeroom] = useState<TeacherInfo | null>(null); // 현재 담임
  const [candidateTeachers, setCandidateTeachers] = useState<TeacherInfo[]>([]); // 추가 가능한 교사 목록
  const [isDirty, setIsDirty] = useState(false); // 수정 여부
  const [viewCategory, setViewCategory] = useState<"STUDENT" | "TEACHER">(
    "STUDENT"
  ); // 현재 보이는 카테고리
  const [searchCurStu, setSearchCurStu] = useState(""); // 현재 학생 검색
  const [searchCandStu, setSearchCandStu] = useState(""); // 추가 가능 학생 검색
  const [searchCandTch, setSearchCandTch] = useState(""); // 추가 가능 교사 검색
  const [showReset, setShowReset] = useState(false); // 반 초기화 모달 표시 여부
  const [resetForm, setResetForm] = useState({ g1: "", g2: "", g3: "" }); // 반 수 입력 값

  // 학급 목록 가져오기
  useEffect(() => {
    const fetchClassList = async () => {
      try {
        const response = await axiosInstance.get(
          `/school/${schoolId}/users/class`
        );
        setClasses(response.data.data); // 학급 데이터 설정
      } catch (error) {
        console.error("학급 목록 가져오기 실패:", error);
      }
    };

    fetchClassList();
  }, [schoolId]);

  // 학급 선택 시 학생 목록, 추가 가능한 학생 목록, 담임 교사, 추가 가능한 교사 목록 갱신
  const refresh = useCallback(
    async (cls: ClassInfo) => {
      try {
        const [inClassRes, unassignedRes, homeroomRes] = await Promise.all([
          axiosInstance.get(
            `/school/${schoolId}/class/${cls.classId}/students`
          ),
          axiosInstance.get(`/school/${schoolId}/students/unassigned`),
          axiosInstance.get(
            `/school/${schoolId}/users/class/${cls.classId}/homeroom`
          ),
        ]);

        console.log("반 학생", inClassRes.data.data);
        console.log("추가 가능 학생", unassignedRes.data.data);
        console.log("교사", homeroomRes.data.data);

        // ---------- 학생 ----------
        setStudents(
          sortAndNumber(
            inClassRes.data.data.map((st: any) => mapStudent(st, cls.classId))
          )
        );

        setCandidateStudents(
          unassignedRes.data.data.map((st: any) => mapStudent(st, null))
        );

        // ---------- 교사 ----------
        const rawHomeroom = homeroomRes.data.data.homeroom;
        const rawOthers = homeroomRes.data.data.notHomeroom;

        setHomeroom(rawHomeroom ? mapTeacher(rawHomeroom) : null);
        setCandidateTeachers(rawOthers.map(mapTeacher));
      } catch (err) {
        console.error("학생/교사 목록 갱신 실패:", err);
      }
    },
    [schoolId]
  );

  // 학급 선택 후 해당 학급에 대한 정보 갱신
  useEffect(() => {
    if (selectedClass) refresh(selectedClass);
  }, [selectedClass, refresh]);

  // 학생 추가
  const addStudent = (stu: StudentInfo) => {
    if (!selectedClass) return;
    setStudents((prev) =>
      sortAndNumber([...prev, { ...stu, classId: selectedClass.classId }])
    );
    setCandidateStudents((prev) =>
      prev.filter((s) => s.studentId !== stu.studentId)
    );
    setIsDirty(true);
  };

  // 학생생 제거
  const removeStudent = (stuId: number) => {
    setStudents((prev) =>
      sortAndNumber(prev.filter((s) => s.studentId !== stuId))
    );
    setCandidateStudents((prev) => {
      const removed = students.find((s) => s.studentId === stuId);
      return removed
        ? [...prev, { ...removed, classId: null, number: 0 }]
        : prev;
    });
    setIsDirty(true);
  };

  // 교사 추가
  const addTeacher = (t: TeacherInfo) => {
    if (homeroom) return; // 이미 담임 있으면 무시
    setHomeroom(t);
    setCandidateTeachers((prev) =>
      prev.filter((tc) => tc.teacherId !== t.teacherId)
    );
    setIsDirty(true);
  };

  // 교사 제거
  const removeTeacher = () => {
    if (!homeroom) return;
    setCandidateTeachers((prev) => [...prev, homeroom]);
    setHomeroom(null);
    setIsDirty(true);
  };

  // 반 저장
  const handleSave = async () => {
    if (!selectedClass) return;

    // 학생 추가/제거 처리
    const addedStudentIds = students
      .filter((student) => student.classId === selectedClass.classId)
      .map((student) => student.studentId);

    const removedStudentIds = students
      .filter((student) => student.classId !== selectedClass.classId)
      .map((student) => student.studentId);

    try {
      // 1. 반 학생 관리 저장
      if (addedStudentIds.length || removedStudentIds.length) {
        await axiosInstance.patch(
          `/school/${schoolId}/users/class/${selectedClass.classId}/managestudent`,
          {
            addedStudentIds,
            removedStudentIds,
          }
        );
        console.log("반 학생 저장 완료");
      }

      // 2. 반 담임 관리 저장
      if (homeroom) {
        await axiosInstance.patch(
          `/school/${schoolId}/users/class/${selectedClass.classId}/manageteacher`,
          {
            newHomeroomTeacherId: homeroom.teacherId,
          }
        );
        console.log("반 교사 저장 완료");
      }

      setIsDirty(false);
      alert("저장되었습니다!");
    } catch (error) {
      console.error("반 저장 실패:", error);
      alert("반 저장 중 오류가 발생했습니다.");
    }
  };

  // 반 초기화
  const handleResetClass = async () => {
    const n1 = Number(resetForm.g1) || 0;
    const n2 = Number(resetForm.g2) || 0;
    const n3 = Number(resetForm.g3) || 0;

    if (n1 === 0 && n2 === 0 && n3 === 0) {
      alert("반 수를 입력하세요");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/school/${schoolId}/users/class`,
        {
          grade1: n1,
          grade2: n2,
          grade3: n3,
        }
      );

      if (response.data.status === 201) {
        alert("반이 성공적으로 생성되었습니다.");
        const list = await axiosInstance.get(`/school/${schoolId}/users/class`);
        setClasses(list.data.data);
      } else {
        alert("반 초기화에 실패했습니다.");
      }
    } catch (error) {
      console.error("반 초기화 실패:", error);
      alert("반 초기화 중 오류가 발생했습니다.");
    } finally {
      setShowReset(false);
      setResetForm({ g1: "", g2: "", g3: "" });
    }
  };

  return (
    <PageWrapper>
      <ClassListWrapper>
        <h2>학급 목록</h2>
        <ResetButton onClick={() => setShowReset(true)}>반 초기화</ResetButton>

        <ClassListScroll>
          {classes.map((c) => (
            <ClassItem
              key={c.classId}
              $active={selectedClass?.classId === c.classId}
              onClick={() => setSelectedClass(c)}
            >
              {c.grade}학년 {c.gradeClass}반
            </ClassItem>
          ))}
        </ClassListScroll>
      </ClassListWrapper>

      {selectedClass ? (
        <MainWrapper>
          <Header>
            <ClassTitle>
              {selectedClass.grade}학년 {selectedClass.gradeClass}반 관리
            </ClassTitle>

            <SaveButton disabled={!isDirty} onClick={handleSave}>
              서버에 저장
            </SaveButton>
          </Header>

          <DropdownRow>
            <CategorySelect
              value={viewCategory}
              onChange={(e) =>
                setViewCategory(e.target.value as "STUDENT" | "TEACHER")
              }
            >
              <option value="STUDENT">학생</option>
              <option value="TEACHER">담임</option>
            </CategorySelect>
          </DropdownRow>

          <ListRow>
            {viewCategory === "STUDENT" && (
              <>
                {/* 현재 학생 */}
                <ScrollBox>
                  <StudentTable style={{ width: "24rem" }}>
                    <thead>
                      <tr>
                        <th colSpan={4}>현재 학생</th>
                      </tr>
                      <tr>
                        <th>번호</th>
                        <th>ID</th>
                        <th>이름</th>
                        <th>제거</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter((s) =>
                          s.name
                            ?.toLowerCase()
                            .includes(searchCurStu.toLowerCase())
                        )
                        .map((st) => (
                          <tr key={st.studentId}>
                            <td>{st.number}</td>
                            <td>{st.studentId}</td>
                            <td>{st.name}</td>
                            <td>
                              <AssignButton
                                onClick={() => removeStudent(st.studentId)}
                              >
                                X
                              </AssignButton>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </StudentTable>
                  <TableSearchInput
                    placeholder="이름 검색"
                    value={searchCurStu}
                    onChange={(e) => setSearchCurStu(e.target.value)}
                  />
                </ScrollBox>

                {/* 추가 가능 학생 */}
                <ScrollBox>
                  <StudentTable style={{ width: "21rem" }}>
                    <thead>
                      <tr>
                        <th colSpan={3}>추가 가능 학생</th>
                      </tr>
                      <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>추가</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateStudents
                        .filter((s) =>
                          s.name
                            ?.toLowerCase()
                            .includes(searchCandStu.toLowerCase())
                        )
                        .map((s) => (
                          <tr key={s.studentId}>
                            <td>{s.studentId}</td>
                            <td>{s.name}</td>
                            <td>
                              <AssignButton onClick={() => addStudent(s)}>
                                +
                              </AssignButton>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </StudentTable>
                  <TableSearchInput
                    placeholder="이름 검색"
                    value={searchCandStu}
                    onChange={(e) => setSearchCandStu(e.target.value)}
                  />
                </ScrollBox>
              </>
            )}

            {viewCategory === "TEACHER" && (
              <>
                {/* 현재 담임 */}
                <ScrollBox>
                  <StudentTable style={{ width: "21rem" }}>
                    <thead>
                      <tr>
                        <th colSpan={3}>현재 담임</th>
                      </tr>
                      <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>제거</th>
                      </tr>
                    </thead>
                    <tbody>
                      {homeroom ? (
                        <tr>
                          <td>{homeroom.teacherId}</td>
                          <td>{homeroom.name}</td>
                          <td>
                            <AssignButton onClick={removeTeacher}>
                              X
                            </AssignButton>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={3}>없음</td>
                        </tr>
                      )}
                    </tbody>
                  </StudentTable>
                </ScrollBox>

                {/* 추가 가능 교사 */}
                <ScrollBox>
                  <StudentTable style={{ width: "21rem" }}>
                    <thead>
                      <tr>
                        <th colSpan={3}>추가 가능 교사</th>
                      </tr>
                      <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>추가</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateTeachers
                        .filter((t) =>
                          t.name
                            ?.toLowerCase()
                            .includes(searchCandTch.toLowerCase())
                        )
                        .map((t) => (
                          <tr key={t.teacherId}>
                            <td>{t.teacherId}</td>
                            <td>{t.name}</td>
                            <td>
                              <AssignButton onClick={() => addTeacher(t)}>
                                +
                              </AssignButton>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </StudentTable>
                  <TableSearchInput
                    placeholder="이름 검색"
                    value={searchCandTch}
                    onChange={(e) => setSearchCandTch(e.target.value)}
                  />
                </ScrollBox>
              </>
            )}
          </ListRow>
        </MainWrapper>
      ) : (
        <MainWrapper>
          <p>왼쪽에서 학급을 선택하세요.</p>
        </MainWrapper>
      )}

      {showReset && (
        <ModalBackdrop>
          <ModalBox>
            <h3>학년별 반 개수 입력</h3>

            {[1, 2, 3].map((g) => (
              <ModalRow key={g}>
                <label>{g}학년</label>
                <ModalNumberInput
                  type="number"
                  min="0"
                  placeholder="0"
                  value={(resetForm as any)[`g${g}`]}
                  onChange={(e) =>
                    setResetForm({ ...resetForm, [`g${g}`]: e.target.value })
                  }
                />
              </ModalRow>
            ))}

            <ModalActionRow>
              <ModalBtn onClick={() => setShowReset(false)}>취소</ModalBtn>
              <ModalBtn onClick={handleResetClass}>확인</ModalBtn>
            </ModalActionRow>
          </ModalBox>
        </ModalBackdrop>
      )}
    </PageWrapper>
  );
};

export default AdminAssignPage;
