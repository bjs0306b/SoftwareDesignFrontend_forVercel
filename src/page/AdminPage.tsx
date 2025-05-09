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

const USE_MOCK = true;

/* ──────────────── Types ──────────────── */
interface ClassInfo {
  classId: number;
  grade: number;
  gradeClass: number;
}
interface TeacherInfo {
  teacherId: number;
  name: string;
  classId: number | null;
}
interface StudentInfo {
  studentId: number;
  name: string;
  classId: number | null;
  number?: number;           // ← 번호(1,2,3…)
}

/* ──────────────── Mock Data ──────────────── */
const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const mockClasses: ClassInfo[] = [
  { classId: 101, grade: 1, gradeClass: 1 },
  { classId: 102, grade: 1, gradeClass: 2 },
  { classId: 201, grade: 2, gradeClass: 1 },
];
const mockAllTeachers: TeacherInfo[] = [
  { teacherId: 11, name: "김교사", classId: 101 },
  { teacherId: 12, name: "이교사", classId: null },
  { teacherId: 13, name: "박교사", classId: 201 },
  { teacherId: 14, name: "최교사", classId: null },
];
const mockAllStudents: StudentInfo[] = [
  { studentId: 1101, name: "김민준", classId: 101 },
  { studentId: 1102, name: "이서연", classId: 101 },
  { studentId: 1201, name: "정지호", classId: 102 },
  { studentId: 1202, name: "조예린", classId: 102 },
  { studentId: 1301, name: "한수빈", classId: null },
  { studentId: 1302, name: "오지훈", classId: null },
];

const mockApi = {
  getClassList: async () => {
    await delay();
    return mockClasses;
  },
  getStudentsInClass: async (cid: number) => {
    await delay();
    return mockAllStudents.filter((s) => s.classId === cid);
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

/* ──────────────── Real API 래퍼 ──────────────── */
const realApi = (schoolId: number | null) => ({
  getClassList: () =>
    axiosInstance.get(`/school/${schoolId}/classes`).then((r) => r.data.data),
  getStudentsInClass: (cid: number) =>
    axiosInstance.get(`/class/${cid}/students`).then((r) => r.data.data),
  getUnassignedStudents: () =>
    axiosInstance.get(`/school/${schoolId}/students/unassigned`).then((r) => r.data.data),
  addStudentToClass: (cid: number, sid: number) =>
    axiosInstance.post(`/class/${cid}/student/${sid}`),
  removeStudentFromClass: (sid: number) =>
    axiosInstance.delete(`/student/${sid}/class`),
  getHomeroomTeacher: (cid: number) =>
    axiosInstance.get(`/class/${cid}/homeroom`).then((r) => r.data.data),
  getUnassignedTeachers: () =>
    axiosInstance.get(`/school/${schoolId}/teachers/unassigned`).then((r) => r.data.data),
  assignHomeroom: (cid: number, tid: number) =>
    axiosInstance.post(`/class/${cid}/homeroom/${tid}`),
  removeHomeroom: (cid: number) => axiosInstance.delete(`/class/${cid}/homeroom`),
});

const AdminPage: React.FC = () => {
  const schoolId = useAuthStore((s) => s.schoolId);
  const api = USE_MOCK ? mockApi : realApi(schoolId);

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [candidateStudents, setCandidateStudents] = useState<StudentInfo[]>([]);
  const [homeroom, setHomeroom] = useState<TeacherInfo | null>(null);
  const [candidateTeachers, setCandidateTeachers] = useState<TeacherInfo[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    api.getClassList().then(setClasses);
  }, [api]);

  const refresh = useCallback(
    async (cls: ClassInfo) => {
      const [
        inClass,
        unassignedStudents,
        homeroomTeacher,
        unassignedTeachers,
      ] = await Promise.all([
        api.getStudentsInClass(cls.classId),
        api.getUnassignedStudents(),
        api.getHomeroomTeacher(cls.classId),
        api.getUnassignedTeachers(),
      ]);

      setStudents(
        inClass
          .sort((a: StudentInfo, b: StudentInfo) => a.name.localeCompare(b.name))
          .map((s: StudentInfo, i: number) => ({ ...s, number: i + 1 })),
      );
      setCandidateStudents(unassignedStudents.sort((a: StudentInfo, b: StudentInfo) => a.name.localeCompare(b.name)));
      setHomeroom(homeroomTeacher);
      setCandidateTeachers(unassignedTeachers.sort((a: TeacherInfo, b: TeacherInfo) => a.name.localeCompare(b.name)));
    },
    [api],
  );

  useEffect(() => {
    if (selectedClass) refresh(selectedClass);
  }, [selectedClass, refresh]);

  const addStudent = async (stu: StudentInfo) => {
    if (!selectedClass) return;
    await api.addStudentToClass(selectedClass.classId, stu.studentId);
    setIsDirty(true);
    refresh(selectedClass);
  };

  const removeStudent = async (sid: number) => {
    if (!selectedClass) return;
    await api.removeStudentFromClass(sid);
    setIsDirty(true);
    refresh(selectedClass);
  };

  const addTeacher = async (t: TeacherInfo) => {
    if (!selectedClass) return;
    await api.assignHomeroom(selectedClass.classId, t.teacherId);
    setIsDirty(true);
    refresh(selectedClass);
  };

  const removeTeacher = async () => {
    if (!selectedClass) return;
    await api.removeHomeroom(selectedClass.classId);
    setIsDirty(true);
    refresh(selectedClass);
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    if (USE_MOCK) {
      alert("Mock 모드: 서버 전송 생략");
      setIsDirty(false);
      return;
    }
    await axiosInstance.put("/class/overwrite", {
      classId: selectedClass.classId,
      students: students.map(({ studentId }) => studentId),
      homeroomId: homeroom?.teacherId ?? null,
    });
    setIsDirty(false);
    alert("저장되었습니다!");
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
                  </tr>
                  <tr>
                    <th>번호</th>
                    <th>ID</th>
                    <th>이름</th>
                    <th>제거</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.studentId}>
                      <td>{st.number}</td>
                      <td>{st.studentId}</td>
                      <td>{st.name}</td>
                      <td>
                        <AssignButton onClick={() => removeStudent(st.studentId)}>X</AssignButton>
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
                    <th>ID</th>
                    <th>이름</th>
                    <th>추가</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateStudents.map((s) => (
                    <tr key={s.studentId}>
                      <td>{s.studentId}</td>
                      <td>{s.name}</td>
                      <td>
                        <AssignButton onClick={() => addStudent(s)}>+</AssignButton>
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
                    <th>ID</th>
                    <th>이름</th>
                    <th>추가</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateTeachers.map((t) => (
                    <tr key={t.teacherId}>
                      <td>{t.teacherId}</td>
                      <td>{t.name}</td>
                      <td>
                        <AssignButton onClick={() => addTeacher(t)}>+</AssignButton>
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
