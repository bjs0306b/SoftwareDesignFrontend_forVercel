import React, { useCallback, useEffect, useState } from "react";
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
} from "./AdminPage.styled";
import { useAuthStore } from "../stores/authStore";

/***********************************************************************
 * AdminPage – 학생/교사 추가·제거를 Mock 데이터로 구현
 * 각 리스트는 개별 스크롤이 되도록 table 을 래핑
 **********************************************************************/

const USE_MOCK = true; // 서버 붙이면 false

/* 타입 */
interface ClassInfo {
  classId: number;
  grade: number;
  gradeClass: number;
}
interface TeacherInfo {
  teacherId: number;
  name: string;
}
interface StudentInfo {
  studentId: number;
  name: string;
  number?: number;
}

/* MOCK */
const mockClasses: ClassInfo[] = [
  { classId: 101, grade: 1, gradeClass: 1 },
  { classId: 102, grade: 1, gradeClass: 2 },
  { classId: 201, grade: 2, gradeClass: 1 },
];
const mockAllTeachers = [
  { teacherId: 11, name: "김교사", classId: 101 },
  { teacherId: 12, name: "이교사", classId: null },
  { teacherId: 13, name: "박교사", classId: 201 },
  { teacherId: 14, name: "최교사", classId: null },
];
const mockAllStudents = [
  { studentId: 1101, name: "김민준", classId: 101 },
  { studentId: 1102, name: "이서연", classId: 101 },
  { studentId: 1201, name: "정지호", classId: 102 },
  { studentId: 1202, name: "조예린", classId: 102 },
  { studentId: 1301, name: "한수빈", classId: null },
  { studentId: 1302, name: "오지훈", classId: null },
];
const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));
const mockApi = {
  getClassList: async () => {
    await delay();
    return mockClasses;
  },
  getStudentsInClass: async (id: number) => {
    await delay();
    return mockAllStudents.filter((s) => s.classId === id);
  },
  getUnassignedStudents: async () => {
    await delay();
    return mockAllStudents.filter((s) => s.classId === null);
  },
  addStudentToClass: async (cid: number, sid: number) => {
    await delay();
    const s = mockAllStudents.find((v) => v.studentId === sid);
    if (s) s.classId = cid;
  },
  removeStudentFromClass: async (sid: number) => {
    await delay();
    const s = mockAllStudents.find((v) => v.studentId === sid);
    if (s) s.classId = null;
  },
  getHomeroomTeacher: async (cid: number) => {
    await delay();
    return mockAllTeachers.find((t) => t.classId === cid) || null;
  },
  getUnassignedTeachers: async () => {
    await delay();
    return mockAllTeachers.filter((t) => t.classId === null);
  },
  assignHomeroom: async (cid: number, tid: number) => {
    await delay();
    mockAllTeachers.forEach((t) => {
      if (t.classId === cid) t.classId = null;
    });
    const t = mockAllTeachers.find((v) => v.teacherId === tid);
    if (t) t.classId = cid;
  },
  removeHomeroom: async (cid: number) => {
    await delay();
    const t = mockAllTeachers.find((v) => v.classId === cid);
    if (t) t.classId = null;
  },
};

const AdminPage: React.FC = () => {
  const schoolId = useAuthStore((s) => s.schoolId);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [candidateStudents, setCandidateStudents] = useState<StudentInfo[]>([]);
  const [homeroom, setHomeroom] = useState<TeacherInfo | null>(null);
  const [candidateTeachers, setCandidateTeachers] = useState<TeacherInfo[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      mockApi.getClassList().then(setClasses);
    } else if (schoolId) {
      axiosInstance
        .get(`/school/${schoolId}/classes`)
        .then((r) => setClasses(r.data.data));
    }
  }, [schoolId]);

  const refresh = useCallback(async (cls: ClassInfo) => {
    if (USE_MOCK) {
      let inCls = await mockApi.getStudentsInClass(cls.classId);
      inCls = inCls
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((s, i) => ({ ...s, number: i + 1 }));
      setStudents(inCls);
      setCandidateStudents(
        (await mockApi.getUnassignedStudents()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setHomeroom(await mockApi.getHomeroomTeacher(cls.classId));
      setCandidateTeachers(
        (await mockApi.getUnassignedTeachers()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    }
  }, []);
  useEffect(() => {
    selectedClass && refresh(selectedClass);
  }, [selectedClass, refresh]);

  const addStudent = async (stu: StudentInfo) => {
    if (!selectedClass) return;
    USE_MOCK
      ? await mockApi.addStudentToClass(selectedClass.classId, stu.studentId)
      : await axiosInstance.post("", {});
    setIsDirty(true);
    refresh(selectedClass);
  };
  const removeStudent = async (id: number) => {
    if (!selectedClass) return;
    USE_MOCK
      ? await mockApi.removeStudentFromClass(id)
      : await axiosInstance.delete("");
    setIsDirty(true);
    refresh(selectedClass);
  };
  const addTeacher = async (t: TeacherInfo) => {
    if (!selectedClass) return;
    USE_MOCK
      ? await mockApi.assignHomeroom(selectedClass.classId, t.teacherId)
      : await axiosInstance.post("", {});
    setIsDirty(true);
    refresh(selectedClass);
  };
  const removeTeacher = async () => {
    if (!selectedClass || !homeroom) return;
    USE_MOCK
      ? await mockApi.removeHomeroom(selectedClass.classId)
      : await axiosInstance.delete("");
    setIsDirty(true);
    refresh(selectedClass);
  };

  const handleSave = async () => {
    if (!selectedClass) return;

    // 저장 로직 ‑ 예시
    if (USE_MOCK) {
      alert("Mock 모드: 변경 내용을 서버로 전송했다고 가정합니다.");
      setIsDirty(false);
      return;
    }

    try {
      await axiosInstance.put("/class/overwrite", {
        classId: selectedClass.classId,
        students: students.map(({ studentId }) => studentId),
        homeroomId: homeroom?.teacherId ?? null,
      });
      setIsDirty(false);
      alert("저장되었습니다!");
    } catch (e) {
      console.error(e);
      alert("저장 실패 ‑ 다시 시도해주세요.");
    }
  };

  return (
    <PageWrapper>
      <ClassListWrapper>
        <h2>학급 목록</h2>
        {classes.map((c) => (
          <ClassItem
            key={c.classId}
            $active={selectedClass?.classId === c.classId}
            onClick={() => setSelectedClass(c)}
          >
            {c.grade}학년 {c.gradeClass}반
          </ClassItem>
        ))}
      </ClassListWrapper>
      {selectedClass ? (
        <MainWrapper>
            <Header>
            <ClassTitle>
                {selectedClass.grade}학년 {selectedClass.gradeClass}반 관리
            </ClassTitle>
            {/* 저장 버튼 – 변경이 없으면 비활성화 */}
            <SaveButton disabled={!isDirty} onClick={handleSave}>
                서버에 저장
            </SaveButton>
            </Header>
          <ListRow>
            {/* 현재 학생 */}
            <ScrollBox>
              <StudentTable style={{ width: "24rem" }}>
                <thead>
                  <tr>
                    <th colSpan={4}>현재 학생</th>
                  </tr>{" "}
                  {/* 새 제목 행 */}
                  <tr>
                    <th>번호</th>
                    <th>ID</th> {/* 추가된 열 */}
                    <th>이름</th>
                    <th>제거</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.studentId}>
                      <td>{st.number}</td>
                      <td>{st.studentId}</td> {/* ID 값 */}
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
            </ScrollBox>
            {/* 추가 가능 학생 */}
            <ScrollBox>
              <StudentTable style={{ width: "21rem" }}>
                <thead>
                  <tr>
                    <th colSpan={3}>추가 가능 학생</th>
                  </tr>
                  <tr>
                    <th>ID</th> {/* ① 새 열 */}
                    <th>이름</th>
                    <th>추가</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateStudents.map((s) => (
                    <tr key={s.studentId}>
                      <td>{s.studentId}</td> {/* ② 값 표시 */}
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
            </ScrollBox>
            {/* 현재 담임 */}
            <ScrollBox>
              <StudentTable style={{ width: "21rem" }}>
                <thead>
                  <tr>
                    <th colSpan={3}>현재 담임</th>
                  </tr>
                  <tr>
                    <th>ID</th> {/* 추가된 열 */}
                    <th>이름</th>
                    <th>제거</th>
                  </tr>
                </thead>
                <tbody>
                  {homeroom ? (
                    <tr>
                      <td>{homeroom.teacherId}</td> {/* ID 값 */}
                      <td>{homeroom.name}</td>
                      <td>
                        <AssignButton onClick={removeTeacher}>X</AssignButton>
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
                    <th>ID</th> {/* 새 열 */}
                    <th>이름</th>
                    <th>추가</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateTeachers.map((t) => (
                    <tr key={t.teacherId}>
                      <td>{t.teacherId}</td> {/* 값 표시 */}
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
            </ScrollBox>
          </ListRow>
        </MainWrapper>
      ) : (
        <MainWrapper>
          <p>왼쪽에서 학급을 선택하세요.</p>
        </MainWrapper>
      )}
    </PageWrapper>
  );
};

export default AdminPage;
