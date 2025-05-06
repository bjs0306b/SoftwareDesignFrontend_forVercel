import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/assets/img/Logo.png";
import bellAlertIcon from "/assets/img/bell-alert.png";
import axiosInstance from "../api/axiosInstance.ts";

import {
  LayoutWrapper,
  Header,
  MainArea,
  PageArea,
  SideBar,
  MainContainer,
  SearchBox,
  TabArea,
  TabButton,
  UserArea,
  NotificationArea,
  StudentList,
  StudentImg,
  StudentClass,
  StudentName,
  UserDropdownMenu,
  UserDropdownItem,
  UserIconContainer,
  UserDropdownButtons,
  DropdownFlexContainer,
  NoteDropdownMenu,
  UserTriangle,
  NoteTriangle,
  NotificationItem,
  NotificationTitle,
  NotificationText,
  SearchButton,
  LogoContainer,
  BellAlert,
  NotificationEmpty,
} from "./MainLayout.styled";
import MyPage from "../page/MyPage";
import { useAuthStore } from "../stores/authStore";
import { useStudentStore } from "../stores/studentStore";

interface Student {
  studentId: number;
  name: string;
  grade: number;
  gradeClass: number;
  number: number;
  img: string;
}

interface NotificationItem {
  notificationId: number;
  userId: number;
  type: "GRADE" | "CONSULTATION" | "FEEDBACK";
  message: string;
  isRead: boolean;
  createdAt: string;
}

const notificationItem = {
  GRADE: {
    title: "성적 관리",
    getText: (name: string) => `${name} 학생 성적이 업데이트 되었습니다.`,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="21"
        viewBox="0 0 20 21"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M3.125 1.85168C2.95924 1.85168 2.80027 1.91753 2.68306 2.03474C2.56585 2.15195 2.5 2.31092 2.5 2.47668V16.1142C2.5 16.2799 2.56585 16.4389 2.68306 16.5561C2.80027 16.6733 2.95924 16.7392 3.125 16.7392H14.375C14.5408 16.7392 14.6997 16.6733 14.8169 16.5561C14.9342 16.4389 15 16.2799 15 16.1142V7.25043C15.0002 7.16651 14.9834 7.08342 14.9508 7.0061C14.9181 6.92879 14.8703 6.85884 14.81 6.80044L9.88875 2.03043C9.77235 1.91695 9.61632 1.85328 9.45375 1.85293L3.125 1.85168ZM12.8325 6.62543L10.0787 3.95418V6.62543H12.8325ZM7.5 7.42044H5V6.17043H7.5V7.42044ZM12.5 10.5454H5V9.29544H12.5V10.5454ZM5 13.6704H12.5V12.4204H5V13.6704Z"
          fill="#B9B9B9"
        />
        <path
          d="M16.25 9.92041V18.0454H5.625V19.2954H16.875C17.0408 19.2954 17.1997 19.2296 17.3169 19.1124C17.4342 18.9951 17.5 18.8362 17.5 18.6704V9.92041H16.25Z"
          fill="#B9B9B9"
        />
      </svg>
    ),
  },
  CONSULTATION: {
    title: "상담내역",
    getText: (name: string) => `${name} 학생 상담내역이 업데이트 되었습니다.`,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="21"
        viewBox="0 0 20 21"
        fill="none"
      >
        <path
          d="M2.5 4.71208C2.5 4.27005 2.67559 3.84613 2.98816 3.53357C3.30072 3.221 3.72464 3.04541 4.16667 3.04541H15.8333C16.2754 3.04541 16.6993 3.221 17.0118 3.53357C17.3244 3.84613 17.5 4.27005 17.5 4.71208V16.3787C17.5 16.8208 17.3244 17.2447 17.0118 17.5573C16.6993 17.8698 16.2754 18.0454 15.8333 18.0454H4.16667C3.72464 18.0454 3.30072 17.8698 2.98816 17.5573C2.67559 17.2447 2.5 16.8208 2.5 16.3787V4.71208ZM9.16667 6.37874C8.72464 6.37874 8.30072 6.55434 7.98816 6.8669C7.67559 7.17946 7.5 7.60338 7.5 8.04541V14.7121H9.16667V11.3787H10.8333V14.7121H12.5V8.04541C12.5 7.60338 12.3244 7.17946 12.0118 6.8669C11.6993 6.55434 11.2754 6.37874 10.8333 6.37874H9.16667ZM9.16667 8.04541H10.8333V9.71208H9.16667V8.04541Z"
          fill="#B9B9B9"
        />
      </svg>
    ),
  },
  FEEDBACK: {
    title: "피드백",
    getText: (name: string) => `${name} 학생 피드백이 업데이트 되었습니다.`,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M1.66602 18.3334V3.33335C1.66602 2.87502 1.82935 2.4828 2.15602 2.15669C2.48268 1.83058 2.8749 1.66724 3.33268 1.66669H16.666C17.1243 1.66669 17.5168 1.83002 17.8435 2.15669C18.1702 2.48335 18.3332 2.87558 18.3327 3.33335V13.3334C18.3327 13.7917 18.1696 14.1842 17.8435 14.5109C17.5174 14.8375 17.1249 15.0006 16.666 15H4.99935L1.66602 18.3334ZM9.99935 12.5C10.2355 12.5 10.4335 12.42 10.5935 12.26C10.7535 12.1 10.8332 11.9022 10.8327 11.6667C10.8321 11.4311 10.7521 11.2334 10.5927 11.0734C10.4332 10.9134 10.2355 10.8334 9.99935 10.8334C9.76324 10.8334 9.56546 10.9134 9.40602 11.0734C9.24657 11.2334 9.16657 11.4311 9.16602 11.6667C9.16546 11.9022 9.24546 12.1003 9.40602 12.2609C9.56657 12.4214 9.76435 12.5011 9.99935 12.5ZM9.16602 9.16669H10.8327V4.16669H9.16602V9.16669Z"
          fill="#B9B9B9"
        />
      </svg>
    ),
  },
} as const;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]); // 초기에는 빈 배열
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태

  const userName = useAuthStore((state) => state.userName);
  const setUserName = useAuthStore((state) => state.setUserName);

  const role = useAuthStore((state) => state.role);
  const setRole = useAuthStore((state) => state.setRole);

  const isHomeroom = useAuthStore((state) => state.isHomeroom);
  const setIsHomeroom = useAuthStore((state) => state.setIsHomeroom);
  const schoolId = useAuthStore((state) => state.schoolId);
  const setSchoolName = useAuthStore((state) => state.setSchoolName);
  const classId = useAuthStore((state) => state.classId);
  const setGradeAndClass = useAuthStore((state) => state.setGradeAndClass);
  const selectedStudent = useStudentStore((state) => state.selectedStudent);
  const setSelectedStudent = useStudentStore(
    (state) => state.setSelectedStudent
  );
  const setClassStudents = useAuthStore((state) => state.setClassStudents);
  const setSubject = useAuthStore((state) => state.setSubject);

  const grade = useAuthStore((state) => state.grade);
  const gradeClass = useAuthStore((state) => state.gradeClass);
  const setStudentInfo = useAuthStore((state) => state.setStudentInfo);

  const accessToken = useAuthStore((state) => state.accessToken);
  // 유저 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!accessToken || !schoolId) return;

        const response = await axiosInstance.get(
          `/school/${schoolId}/users/me`
        );
        console.log("유저 정보 불러오기 성공:", response.data);
        const { name, role, teacher, student, school } = response.data.data;
        setUserName(name);
        setRole(role);
        setIsHomeroom(teacher?.isHomeroom ?? false);
        setSchoolName(school?.schoolName || "");
        setGradeAndClass(teacher?.class.grade, teacher?.class.gradeClass);
        setSubject(teacher?.subject || "");

        if (role === "STUDENT" && student) {
          setStudentInfo({
            studentId: student.studentId,
            grade: student.grade,
            gradeClass: student.gradeClass,
            number: student.number,
          });
          setSelectedStudent({
            studentId: student.studentId,
            name: name,
            grade: student.grade,
            gradeClass: student.gradeClass,
            number: student.number,
            img: "",
          });
        }
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    fetchUserInfo();
  }, [
    accessToken,
    schoolId,
    setUserName,
    setRole,
    setIsHomeroom,
    setSchoolName,
    setGradeAndClass,
    setSubject,
    setStudentInfo,
    setSelectedStudent,
  ]);

  // 반 학생 목록 가져오기
  const fetchClassStudents = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token || !schoolId) return;

      const response = await axiosInstance.get(
        `/school/${schoolId}/class/${classId}/students`
      );

      if (response.data.status === 200) {
        // API 응답 구조에 맞게 데이터 변환
        const studentsData = response.data.data.map(
          (item: {
            studentId: number;
            grade: number;
            gradeClass: number;
            number: number;
            user: { name: string; schoolId?: number };
          }) => ({
            studentId: item.studentId,
            name: item.user.name,
            grade: item.grade,
            gradeClass: item.gradeClass,
            number: item.number,
            img: "/assets/img/photo.png", // 기본 이미지 경로 설정
          })
        );
        // console.log("반 학생:", studentsData);

        studentsData.sort((a: Student, b: Student) => a.number - b.number);
        setStudents(studentsData);
        setClassStudents(studentsData);
      }
    } catch (error) {
      console.error("반 학생 목록 조회 실패:", error);
      setStudents([]);
    }
  }, [schoolId, classId, setClassStudents]);

  useEffect(() => {
    if (isHomeroom) {
      fetchClassStudents();
    }
  }, [isHomeroom, schoolId, classId, fetchClassStudents]);

  // 학생 검색
  const handleSearch = async () => {
    try {
      if (!schoolId) return;

      // 검색어가 있는 경우 학생 검색 API 호출
      if (searchQuery.trim()) {
        const response = await axiosInstance.get(
          `/school/${schoolId}/search/student?name=${searchQuery}`
        );
        console.log("학생 검색", response.data);
        const studentsData = response.data.data.map(
          (item: {
            email: string;
            name: string;
            student: {
              grade: number;
              gradeClass: number;
              number: number;
              studentId: number;
            };
          }) => ({
            studentId: item.student.studentId,
            name: item.name,
            grade: item.student.grade,
            gradeClass: item.student.gradeClass,
            number: item.student.number,
            img: "/assets/img/photo.png", // 기본 이미지 경로 설정
          })
        );
        console.log("검색한 학생들", studentsData);
        setStudents(studentsData);
      } else if (isHomeroom) {
        // 검색어가 없고 담임인 경우, 전체 반 학생 목록을 다시 불러옴
        fetchClassStudents();
      }
    } catch (error) {
      console.error("학생 검색 실패:", error);
      // 에러 발생 시 빈 배열 또는 초기 학생 목록 설정
      // 담임인 경우 기존 반 학생 목록을 유지
      if (!isHomeroom) {
        setStudents([]);
      }
    }
  };

  // 학생 클릭 시 상세정보 조회
  const fetchStudentDetails = async (studentId: number) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token || !schoolId) return;
      console.log("학생 상세정보 조회", studentId);

      const response = await axiosInstance.get(
        `/school/${schoolId}/students/${studentId}`
      );

      if (response.data.status === 200) {
        const studentData = response.data.data;
        // API 응답을 selectedStudent 형식에 맞게 변환
        const formattedStudent: Student = {
          studentId: studentData.studentId,
          name: studentData.user.name,
          grade: studentData.grade,
          gradeClass: studentData.gradeClass,
          number: studentData.number,
          img: studentData.user.photo || "/assets/img/photo.png", // 사진이 없는 경우 기본 이미지 사용
        };

        setSelectedStudent(formattedStudent);

        if (location.pathname === "/main") {
          navigate("/student-info");
        }
      }
    } catch (error) {
      console.error("학생 상세정보 조회 실패:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  //MyPage 모달용
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);

  //유저 드롭다운 메뉴
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    if (isNoteDropdownOpen) {
      setNoteDropdownOpen(false);
    }
    setUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token || !schoolId) return;

      const response = await axiosInstance.post(`/auth/sign-out`, {});
      console.log("로그아웃 성공:", response.data);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  };

  // 알림 드롭다운 메뉴
  const [isNoteDropdownOpen, setNoteDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const hasUnread = notifications.some((n) => !n.isRead);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/school/${schoolId}/notifications`
      );
      setNotifications(response.data.notification);
      console.log(response.data);
    } catch (err) {
      console.error("알림 불러오기 실패:", err);
    }
  }, [schoolId]);

  const handleNotificationClick = async (
    notificationId: number,
    type: string
  ) => {
    try {
      // 알림 읽음 처리 API 요청
      await axiosInstance.get(
        `/school/${schoolId}/notifications/${notificationId}`
      );

      // 알림 유형에 따라 라우팅
      switch (type) {
        case "GRADE":
          navigate("/grade");
          break;
        case "CONSULTATION":
          navigate("/counseling");
          break;
        case "FEEDBACK":
          navigate("/feedback");
          break;
        default:
          break;
      }

      fetchNotifications();
    } catch (err) {
      console.error("알림 처리 실패:", err);
    }
  };

  useEffect(() => {
    if (!hasFetched && schoolId) {
      fetchNotifications(); // MainLayout 진입 시 호출
      setHasFetched(true);
    }
  }, [schoolId, hasFetched, fetchNotifications]);

  useEffect(() => {
    if (isNoteDropdownOpen && schoolId) {
      fetchNotifications(); // 알림 펼칠 때마다 최신화
    }
  }, [fetchNotifications, isNoteDropdownOpen, schoolId]);

  const toggleNoteDropdown = () => {
    if (isUserDropdownOpen) {
      setUserDropdownOpen(false);
    }
    setNoteDropdownOpen(!isNoteDropdownOpen);
  };

  // 드롭다운 영역 외 클릭 시 닫히도록 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen || isNoteDropdownOpen) {
        const target = event.target as Node;
        if (
          !document.getElementById("userDropdown")?.contains(target) &&
          !document.getElementById("noteDropdown")?.contains(target)
        ) {
          setUserDropdownOpen(false);
          setNoteDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen, isNoteDropdownOpen]);

  const handleLogoClick = async () => {
    await fetchNotifications();
    setSelectedStudent(null);
    navigate("/main");
  };

  return (
    <LayoutWrapper data-testid="layout-wrapper">
      <Header data-testid="header">
        <LogoContainer
          onClick={() => {
            handleLogoClick();
          }}
          data-testid="logo-link"
        >
          <img className="logo-img" src={Logo} alt="logo" data-testid="logo" />
        </LogoContainer>
        <UserArea data-testid="user-area">
          <div>
            <p>
              {userName} {role === "TEACHER" ? "선생님" : "학생"}
            </p>
            <UserIconContainer id="userDropdown" onClick={toggleUserDropdown}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="44"
                height="48"
                viewBox="0 0 44 48"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M22.0007 0.333374C10.0342 0.333374 0.333984 10.0335 0.333984 22C0.333984 33.9665 10.0342 43.6667 22.0007 43.6667C33.9672 43.6667 43.6673 33.9665 43.6673 22C43.6673 10.0335 33.9672 0.333374 22.0007 0.333374ZM14.4173 16.5834C14.4173 15.5875 14.6135 14.6014 14.9946 13.6814C15.3757 12.7613 15.9342 11.9253 16.6384 11.2211C17.3426 10.517 18.1786 9.95839 19.0986 9.57729C20.0187 9.19619 21.0048 9.00004 22.0007 9.00004C22.9965 9.00004 23.9826 9.19619 24.9027 9.57729C25.8227 9.95839 26.6587 10.517 27.3629 11.2211C28.0671 11.9253 28.6256 12.7613 29.0067 13.6814C29.3878 14.6014 29.584 15.5875 29.584 16.5834C29.584 18.5946 28.785 20.5235 27.3629 21.9456C25.9407 23.3678 24.0119 24.1667 22.0007 24.1667C19.9894 24.1667 18.0606 23.3678 16.6384 21.9456C15.2163 20.5235 14.4173 18.5946 14.4173 16.5834ZM35.5597 32.7987C33.9372 34.8383 31.8752 36.4853 29.5275 37.6167C27.1798 38.7482 24.6068 39.335 22.0007 39.3334C19.3945 39.335 16.8216 38.7482 14.4738 37.6167C12.1261 36.4853 10.0641 34.8383 8.44165 32.7987C11.9538 30.2789 16.7465 28.5 22.0007 28.5C27.2548 28.5 32.0475 30.2789 35.5597 32.7987Z"
                  fill="black"
                />
              </svg>
              {isUserDropdownOpen && (
                <>
                  <UserTriangle />
                  <UserDropdownMenu>
                    <DropdownFlexContainer>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="44"
                        height="48"
                        viewBox="0 0 44 48"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M22.0007 0.333374C10.0342 0.333374 0.333984 10.0335 0.333984 22C0.333984 33.9665 10.0342 43.6667 22.0007 43.6667C33.9672 43.6667 43.6673 33.9665 43.6673 22C43.6673 10.0335 33.9672 0.333374 22.0007 0.333374ZM14.4173 16.5834C14.4173 15.5875 14.6135 14.6014 14.9946 13.6814C15.3757 12.7613 15.9342 11.9253 16.6384 11.2211C17.3426 10.517 18.1786 9.95839 19.0986 9.57729C20.0187 9.19619 21.0048 9.00004 22.0007 9.00004C22.9965 9.00004 23.9826 9.19619 24.9027 9.57729C25.8227 9.95839 26.6587 10.517 27.3629 11.2211C28.0671 11.9253 28.6256 12.7613 29.0067 13.6814C29.3878 14.6014 29.584 15.5875 29.584 16.5834C29.584 18.5946 28.785 20.5235 27.3629 21.9456C25.9407 23.3678 24.0119 24.1667 22.0007 24.1667C19.9894 24.1667 18.0606 23.3678 16.6384 21.9456C15.2163 20.5235 14.4173 18.5946 14.4173 16.5834ZM35.5597 32.7987C33.9372 34.8383 31.8752 36.4853 29.5275 37.6167C27.1798 38.7482 24.6068 39.335 22.0007 39.3334C19.3945 39.335 16.8216 38.7482 14.4738 37.6167C12.1261 36.4853 10.0641 34.8383 8.44165 32.7987C11.9538 30.2789 16.7465 28.5 22.0007 28.5C27.2548 28.5 32.0475 30.2789 35.5597 32.7987Z"
                          fill="black"
                        />
                      </svg>
                      <p>
                        {userName} {role === "TEACHER" ? "선생님" : "학생"}
                      </p>
                    </DropdownFlexContainer>
                    <UserDropdownButtons>
                      <UserDropdownItem onClick={() => setIsMyPageOpen(true)}>
                        개인정보 수정/설정
                      </UserDropdownItem>
                      <UserDropdownItem onClick={handleLogout}>
                        로그아웃
                      </UserDropdownItem>
                    </UserDropdownButtons>
                  </UserDropdownMenu>
                </>
              )}
            </UserIconContainer>
          </div>
        </UserArea>
        <NotificationArea id="noteDropdown" onClick={toggleNoteDropdown}>
          {hasUnread ? (
            <BellAlert>
              <img src={bellAlertIcon} alt="bell alert" />
            </BellAlert>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M35 31.6667V33.3334H5V31.6667L8.33333 28.3334V18.3334C8.33333 13.1667 11.7167 8.61671 16.6667 7.15004V6.66671C16.6667 5.78265 17.0179 4.93481 17.643 4.30968C18.2681 3.68456 19.1159 3.33337 20 3.33337C20.8841 3.33337 21.7319 3.68456 22.357 4.30968C22.9821 4.93481 23.3333 5.78265 23.3333 6.66671V7.15004C28.2833 8.61671 31.6667 13.1667 31.6667 18.3334V28.3334L35 31.6667ZM23.3333 35C23.3333 35.8841 22.9821 36.7319 22.357 37.3571C21.7319 37.9822 20.8841 38.3334 20 38.3334C19.1159 38.3334 18.2681 37.9822 17.643 37.3571C17.0179 36.7319 16.6667 35.8841 16.6667 35"
                fill="black"
              />
            </svg>
          )}
          {isNoteDropdownOpen && (
            <>
              <NoteTriangle />
              <NoteDropdownMenu>
                <div>
                  {notifications.length === 0 ? (
                    <NotificationEmpty>
                      새로운 알림이 없습니다.
                    </NotificationEmpty>
                  ) : (
                    notifications.map((note) => {
                      const item = notificationItem[note.type];
                      return (
                        <NotificationItem
                          key={note.notificationId}
                          onClick={() =>
                            handleNotificationClick(
                              note.notificationId,
                              note.type
                            )
                          }
                          style={{ cursor: "pointer" }}
                        >
                          {item.icon}
                          <div>
                            <NotificationTitle>{item.title}</NotificationTitle>
                            <NotificationText>
                              {item.getText(userName)}
                            </NotificationText>
                          </div>
                        </NotificationItem>
                      );
                    })
                  )}
                </div>
              </NoteDropdownMenu>
            </>
          )}
        </NotificationArea>
      </Header>
      <MainContainer>
        <SideBar>
          {role === "STUDENT" ? (
            <>
              <StudentImg src="/assets/img/photo.png" alt="image" />
              <StudentClass>
                {grade}학년 {gradeClass}반
              </StudentClass>
              <StudentName>{userName} 학생</StudentName>
            </>
          ) : (
            <>
              {selectedStudent && (
                <>
                  <StudentImg src="/assets/img/photo.png" alt="image" />
                  <StudentClass>
                    {selectedStudent.grade}학년 {selectedStudent.gradeClass}반
                  </StudentClass>
                  <StudentName>{selectedStudent.name} 학생</StudentName>
                </>
              )}
              <SearchBox data-testid="search-box">
                <input
                  data-testid="student-search-input"
                  type="text"
                  placeholder="학생 이름을 검색하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <SearchButton
                  data-testid="search-button"
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
              </SearchBox>
              <StudentList
                data-testid="student-list"
                $isStudentSelected={!!selectedStudent}
              >
                <table>
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>학년</th>
                      <th>반</th>
                      <th>번호</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student, index) => (
                        <tr
                          key={index}
                          onClick={() => {
                            fetchStudentDetails(student.studentId);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{student.name}</td>
                          <td>{student.grade}</td>
                          <td>{student.gradeClass}</td>
                          <td>{student.number}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </StudentList>
            </>
          )}
        </SideBar>

        <MainArea>
          <TabArea data-testid="tab-area">
            <TabButton
              data-testid="tab-student-info"
              $isActive={location.pathname === "/student-info"}
              onClick={() => navigate("/student-info")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M16.0007 5.33333C17.4151 5.33333 18.7717 5.89523 19.7719 6.89543C20.7721 7.89562 21.334 9.25217 21.334 10.6667C21.334 12.0811 20.7721 13.4377 19.7719 14.4379C18.7717 15.4381 17.4151 16 16.0007 16C14.5862 16 13.2296 15.4381 12.2294 14.4379C11.2292 13.4377 10.6673 12.0811 10.6673 10.6667C10.6673 9.25217 11.2292 7.89562 12.2294 6.89543C13.2296 5.89523 14.5862 5.33333 16.0007 5.33333ZM16.0007 18.6667C21.894 18.6667 26.6673 21.0533 26.6673 24V26.6667H5.33398V24C5.33398 21.0533 10.1073 18.6667 16.0007 18.6667Z"
                  fill="white"
                />
              </svg>
              <p>학생 정보</p>
            </TabButton>
            <TabButton
              data-testid="tab-student-manage"
              $isActive={location.pathname === "/student-manage"}
              onClick={() => navigate("/student-manage")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="28"
                viewBox="0 0 24 28"
                fill="none"
              >
                <path
                  d="M5.14286 0C2.30357 0 0 2.35156 0 5.25V22.75C0 25.6484 2.30357 28 5.14286 28H22.2857C23.2339 28 24 27.218 24 26.25C24 25.282 23.2339 24.5 22.2857 24.5V21C23.2339 21 24 20.218 24 19.25V1.75C24 0.782031 23.2339 0 22.2857 0H5.14286ZM5.14286 21H18.8571V24.5H5.14286C4.19464 24.5 3.42857 23.718 3.42857 22.75C3.42857 21.782 4.19464 21 5.14286 21ZM6.85714 7.875C6.85714 7.39375 7.24286 7 7.71429 7H18C18.4714 7 18.8571 7.39375 18.8571 7.875C18.8571 8.35625 18.4714 8.75 18 8.75H7.71429C7.24286 8.75 6.85714 8.35625 6.85714 7.875ZM7.71429 10.5H18C18.4714 10.5 18.8571 10.8937 18.8571 11.375C18.8571 11.8563 18.4714 12.25 18 12.25H7.71429C7.24286 12.25 6.85714 11.8563 6.85714 11.375C6.85714 10.8937 7.24286 10.5 7.71429 10.5Z"
                  fill="white"
                />
              </svg>
              <p>학생부 관리</p>
            </TabButton>
            <TabButton
              data-testid="tab-grade-manage"
              $isActive={location.pathname === "/grade"}
              onClick={() => {
                navigate("/grade");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M4 6.66667C4 5.95942 4.28095 5.28115 4.78105 4.78105C5.28115 4.28095 5.95942 4 6.66667 4H25.3333C26.0406 4 26.7189 4.28095 27.219 4.78105C27.719 5.28115 28 5.95942 28 6.66667V25.3333C28 26.0406 27.719 26.7189 27.219 27.219C26.7189 27.719 26.0406 28 25.3333 28H6.66667C5.95942 28 5.28115 27.719 4.78105 27.219C4.28095 26.7189 4 26.0406 4 25.3333V6.66667ZM14.6667 9.33333C13.9594 9.33333 13.2811 9.61428 12.781 10.1144C12.281 10.6145 12 11.2928 12 12V22.6667H14.6667V17.3333H17.3333V22.6667H20V12C20 11.2928 19.719 10.6145 19.219 10.1144C18.7189 9.61428 18.0406 9.33333 17.3333 9.33333H14.6667ZM14.6667 12H17.3333V14.6667H14.6667V12Z"
                  fill="white"
                />
              </svg>
              <p>학생 성적 관리</p>
            </TabButton>
            <TabButton
              data-testid="tab-counseling"
              $isActive={location.pathname === "/counseling"}
              onClick={() => navigate("/counseling")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5 2.08997C4.73478 2.08997 4.48043 2.19532 4.29289 2.38286C4.10536 2.5704 4 2.82475 4 3.08997V24.91C4 25.1752 4.10536 25.4295 4.29289 25.6171C4.48043 25.8046 4.73478 25.91 5 25.91H23C23.2652 25.91 23.5196 25.8046 23.7071 25.6171C23.8946 25.4295 24 25.1752 24 24.91V10.728C24.0003 10.5937 23.9735 10.4607 23.9213 10.337C23.869 10.2133 23.7924 10.1014 23.696 10.008L15.822 2.37597C15.6358 2.19438 15.3861 2.09251 15.126 2.09197L5 2.08997ZM20.532 9.72797L16.126 5.45397V9.72797H20.532ZM12 11H8V8.99997H12V11ZM20 16H8V14H20V16ZM8 21H20V19H8V21Z"
                  fill="white"
                />
                <path
                  d="M26 15V28H9V30H27C27.2652 30 27.5196 29.8946 27.7071 29.7071C27.8946 29.5196 28 29.2652 28 29V15H26Z"
                  fill="white"
                />
              </svg>
              <p>상담 내역</p>
            </TabButton>
            <TabButton
              data-testid="tab-feedback"
              $isActive={location.pathname === "/feedback"}
              onClick={() => navigate("/feedback")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M2.66602 29.3333V5.33334C2.66602 4.6 2.92735 3.97245 3.45002 3.45067C3.97268 2.92889 4.60024 2.66756 5.33268 2.66667H26.666C27.3993 2.66667 28.0273 2.92801 28.55 3.45067C29.0727 3.97334 29.3336 4.60089 29.3327 5.33334V21.3333C29.3327 22.0667 29.0718 22.6947 28.55 23.2173C28.0282 23.74 27.4002 24.0009 26.666 24H7.99935L2.66602 29.3333ZM15.9993 20C16.3771 20 16.694 19.872 16.95 19.616C17.206 19.36 17.3336 19.0436 17.3327 18.6667C17.3318 18.2898 17.2038 17.9733 16.9487 17.7173C16.6936 17.4613 16.3771 17.3333 15.9993 17.3333C15.6216 17.3333 15.3051 17.4613 15.05 17.7173C14.7949 17.9733 14.6669 18.2898 14.666 18.6667C14.6651 19.0436 14.7931 19.3604 15.05 19.6173C15.3069 19.8742 15.6233 20.0018 15.9993 20ZM14.666 14.6667H17.3327V6.66667H14.666V14.6667Z"
                  fill="white"
                />
              </svg>
              <p>피드백 내역</p>
            </TabButton>
            <TabButton
              data-testid="tab-report"
              $isActive={location.pathname === "/report"}
              onClick={() => navigate("/report")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M4.00065 18.6667L4.66732 18.76L10.7607 12.6667C10.6384 12.2189 10.6382 11.7466 10.7601 11.2988C10.8821 10.851 11.1216 10.444 11.454 10.12C12.494 9.06667 14.174 9.06667 15.214 10.12C15.9207 10.8133 16.1473 11.8 15.9073 12.6667L19.334 16.0933L20.0007 16C20.2407 16 20.4673 16 20.6673 16.0933L25.4273 11.3333C25.334 11.1333 25.334 10.9067 25.334 10.6667C25.334 9.95942 25.6149 9.28115 26.115 8.78105C26.6151 8.28095 27.2934 8 28.0007 8C28.7079 8 29.3862 8.28095 29.8863 8.78105C30.3864 9.28115 30.6673 9.95942 30.6673 10.6667C30.6673 11.3739 30.3864 12.0522 29.8863 12.5523C29.3862 13.0524 28.7079 13.3333 28.0007 13.3333C27.7607 13.3333 27.534 13.3333 27.334 13.24L22.574 18C22.6673 18.2 22.6673 18.4267 22.6673 18.6667C22.6673 19.3739 22.3864 20.0522 21.8863 20.5523C21.3862 21.0524 20.7079 21.3333 20.0007 21.3333C19.2934 21.3333 18.6151 21.0524 18.115 20.5523C17.6149 20.0522 17.334 19.3739 17.334 18.6667L17.4273 18L14.0007 14.5733C13.574 14.6667 13.094 14.6667 12.6673 14.5733L6.57398 20.6667L6.66732 21.3333C6.66732 22.0406 6.38637 22.7189 5.88627 23.219C5.38617 23.719 4.7079 24 4.00065 24C3.29341 24 2.61513 23.719 2.11503 23.219C1.61494 22.7189 1.33398 22.0406 1.33398 21.3333C1.33398 20.6261 1.61494 19.9478 2.11503 19.4477C2.61513 18.9476 3.29341 18.6667 4.00065 18.6667Z"
                  fill="white"
                />
              </svg>
              <p>보고서 생성</p>
            </TabButton>
          </TabArea>
          <PageArea data-testid="page-area">{children}</PageArea>
        </MainArea>
      </MainContainer>
      {isMyPageOpen && <MyPage onClose={() => setIsMyPageOpen(false)} />}
    </LayoutWrapper>
  );
};

export default MainLayout;
