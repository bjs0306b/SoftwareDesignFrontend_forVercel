import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "/assets/img/Logo_2w.png";
import {
  SplitScreen,
  LeftCard,
  WelcomeLogo,
  RightCard,
  InputArea,
  SignButton,
  SecondaryArea,
  InnerContent,
  DropDown,
  InputText,
  Line,
  SchoolList,
  SchoolItem,
  ToggleButton,
  StudentInputArea,
  StudentInput,
  MiniInput,
  EmailButton,
  KakaoButton,
  Title,
} from "./SignInPage.styled";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdOutlineMail } from "react-icons/md";
import { useAuthStore } from "../stores/authStore";

interface School {
  schoolId: number;
  schoolName: string;
}

interface SignUpPayload {
  schoolName: string;
  name: string;
  password: string;
  passwordCheck: string;
  email: string;
  role: string;
  photo: string;
  subject?: string;
  student?: {
    create: {
      grade: number;
      classId: number;
      gradeClass: number;
      number: number;
    };
  };
}
const SignInPage: React.FC = () => {
  const [mode, setMode] = useState<
    | "selectSignIn"
    | "signIn"
    | "selectSignUp"
    | "signUp"
    | "forgotPassword"
    | "additionalInfo"
  >("selectSignIn");
  const navigate = useNavigate();
  const location = useLocation();
  //회원가입용(교사)
  const [userType, setUserType] = useState("TEACHER");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolResults, setSchoolResults] = useState<School[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [subject, setSubject] = useState("국어");

  //회원가입용(학생)
  const [studentGrade, setStudentGrade] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentNumber, setStudentNumber] = useState("");

  //로그인
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const setAuthTokens = useAuthStore((state) => state.setAuthTokens);
  const setSchoolAndClass = useAuthStore((state) => state.setSchoolAndClass);

  const searchTimeoutRef = useRef<number | null>(null);

  const handleSchoolSearch = (query: string) => {
    setSchoolQuery(query);
    setSelectedSchool("");

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length === 0) {
      setSchoolResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsDropdownOpen(true);

    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await axios.get("/api/v1/school", {
          params: { schoolName: query },
        });
        const schools: School[] = response.data.data;
        setSchoolResults(schools);
      } catch (error) {
        console.error("학교 검색 실패", error);
        setSchoolResults([]);
      }
    }, 300);
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school.schoolName);
    setSchoolQuery(school.schoolName);
    setSchoolResults([]);
    setIsDropdownOpen(false);
  };

  //컴포넌트 언마운트 시 클리어
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSignIn = async () => {
    try {
      if (!selectedSchool.trim()) {
        alert("학교명을 검색 후 리스트에서 선택해주세요.");
        return;
      }

      const response = await axios.post("/api/v1/auth/sign-in", {
        email: loginEmail,
        password: loginPassword,
        schoolName: selectedSchool,
      });

      const { accessToken, refreshToken, schoolId, classId } =
        response.data.data;
      console.log("로그인 성공:", response.data);

      setAuthTokens(accessToken, refreshToken);
      setSchoolAndClass(Number(schoolId), classId ?? 0);

      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("schoolId", String(schoolId));
      if (classId !== undefined) {
        sessionStorage.setItem("classId", String(classId)); // 담임인 경우만
      }

      navigate("/main");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "로그인 실패");
      } else {
        alert("알 수 없는 에러 발생");
      }
    }
  };

  const handleSignUp = async () => {
    if (!selectedSchool.trim()) {
      alert("학교명을 검색 후 리스트에서 선택해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (userType === "TEACHER" && !subject) {
      alert("담당 과목을 선택해주세요.");
      return;
    }

    if (userType === "STUDENT") {
      if (!studentGrade || !studentClass || !studentNumber) {
        alert("학년, 반, 번호를 모두 입력해주세요.");
        return;
      }
    }

    const payload: SignUpPayload = {
      schoolName: selectedSchool,
      name,
      email,
      password,
      passwordCheck: confirmPassword,
      role: userType,
      ...(userType === "TEACHER" && { subject }),
      ...(userType === "STUDENT" && {
        grade: Number(studentGrade),
        classId: Number(studentClass),
        number: Number(studentNumber),
        gradeClass: 1,
      }),
      photo: "",
    };

    try {
      console.log("STUDENT 최종 payload:", payload);
      await signUp(payload);
      alert("회원가입 성공!");
      setMode("signIn");
    } catch (err) {
      console.error("회원가입 실패", err);
      alert("회원가입 실패");
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = "http://3.38.130.125:3000/api/v1/auth/kakao/sign-in";
  };

  //카카오 추가정보용
  const handleSubmitKakaoInfo = async () => {
    if (!selectedSchool.trim()) {
      alert("학교명을 검색 후 리스트에서 선택해주세요.");
      return;
    }

    const payload =
      userType === "TEACHER"
        ? {
            name,
            role: "TEACHER",
            subject,
            schoolName: selectedSchool,
          }
        : {
            name,
            role: "STUDENT",
            grade: Number(studentGrade),
            gradeClass: Number(studentClass),
            number: Number(studentNumber),
            schoolName: selectedSchool,
          };

    try {
      const response = await axios.post("/api/v1/auth/kakao/info", payload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });

      console.log(response.data);
      alert("카카오 회원가입 완료");
      navigate("/main");
    } catch (error) {
      alert("추가 정보 제출 실패");
      console.error(error);
    }
  };

  const signUp = async (payload: SignUpPayload) => {
    try {
      const response = await axios.post(`/api/v1/auth/sign-up`, payload);
      console.log("회원가입 성공:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("회원가입 실패:", error.response?.data || error.message);
      } else {
        console.error("예상치 못한 에러:", error);
      }
      throw error;
    }
  };

  //카카오 리디렉션 후 전역 상태 세팅 및 추가정보 분기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const needsExtraInfo = params.get("needsExtraInfo") === "true";
    const schoolId = params.get("schoolId");
    const classId = params.get("classId");

    if (accessToken && refreshToken) {
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      if (schoolId) sessionStorage.setItem("schoolId", schoolId);
      if (classId) sessionStorage.setItem("classId", classId);

      setAuthTokens(accessToken, refreshToken);
      if (schoolId) setSchoolAndClass(Number(schoolId), Number(classId) || 0);

      if (needsExtraInfo) {
        setMode("additionalInfo");
      } else {
        navigate("/main");
      }
    }
  }, [location.search, navigate, setAuthTokens, setSchoolAndClass]);

  const renderForm = () => {
    switch (mode) {
      case "selectSignIn":
        return (
          <>
            <Title>로그인</Title>
            <KakaoButton onClick={handleKakaoLogin}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
              >
                <g clipPath="url(#clip0_303_153)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18 1.19995C8.05835 1.19995 0 7.42587 0 15.1045C0 19.88 3.11681 24.0899 7.86305 26.5939L5.86606 33.8889C5.68962 34.5335 6.42683 35.0473 6.99293 34.6738L15.7467 28.8964C16.4854 28.9676 17.2362 29.0093 18 29.0093C27.9409 29.0093 35.9999 22.7836 35.9999 15.1045C35.9999 7.42587 27.9409 1.19995 18 1.19995Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_303_153">
                    <rect width="35.9999" height="36" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <div>카카오 로그인</div>
            </KakaoButton>
            <Line />
            <EmailButton onClick={() => setMode("signIn")}>
              <MdOutlineMail />
              <div>이메일로 로그인</div>
            </EmailButton>
          </>
        );
      case "signIn":
        return (
          <>
            <Title>로그인</Title>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
            >
              <InputText>학교명</InputText>
              <InputArea style={{ position: "relative" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    left: "20",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  data-testid="login-school-input"
                  placeholder="학교명을 검색하세요"
                  type="text"
                  value={schoolQuery}
                  onChange={(e) => handleSchoolSearch(e.target.value)}
                  style={{ paddingLeft: "2rem" }}
                />
                {isDropdownOpen && schoolResults.length > 0 && (
                  <SchoolList>
                    {schoolResults.map((school) => (
                      <SchoolItem
                        key={school.schoolId}
                        onClick={() => handleSchoolSelect(school)}
                      >
                        {school.schoolName}
                      </SchoolItem>
                    ))}
                  </SchoolList>
                )}
              </InputArea>
              <InputText>아이디</InputText>
              <InputArea>
                <input
                  data-testid="login-email-input"
                  placeholder="example@email.com"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </InputArea>
              <InputText>비밀번호</InputText>
              <InputArea>
                <input
                  data-testid="login-password-input"
                  placeholder="비밀번호를 입력하세요"
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  autoComplete="off"
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <ToggleButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </ToggleButton>
              </InputArea>
              <SignButton
                data-testid="login-submit-button"
                onClick={handleSignIn}
              >
                <p>로그인</p>
              </SignButton>
            </form>
          </>
        );
      case "selectSignUp":
        return (
          <>
            <Title>회원가입</Title>
            <KakaoButton onClick={handleKakaoLogin}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
              >
                <g clip-path="url(#clip0_303_153)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18 1.19995C8.05835 1.19995 0 7.42587 0 15.1045C0 19.88 3.11681 24.0899 7.86305 26.5939L5.86606 33.8889C5.68962 34.5335 6.42683 35.0473 6.99293 34.6738L15.7467 28.8964C16.4854 28.9676 17.2362 29.0093 18 29.0093C27.9409 29.0093 35.9999 22.7836 35.9999 15.1045C35.9999 7.42587 27.9409 1.19995 18 1.19995Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_303_153">
                    <rect width="35.9999" height="36" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <div>카카오로 회원가입</div>
            </KakaoButton>
            <Line />
            <EmailButton onClick={() => setMode("signUp")}>
              <MdOutlineMail />
              <div>이메일로 회원가입</div>
            </EmailButton>
          </>
        );
      case "signUp":
        return (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignUp();
              }}
            >
              <DropDown
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="TEACHER">교사</option>
                <option value="PARENT">학부모</option>
                <option value="STUDENT">학생</option>
              </DropDown>
              {userType === "TEACHER" && (
                <>
                  <InputText>담당 과목</InputText>
                  <DropDown
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="국어">국어</option>
                    <option value="영어">영어</option>
                    <option value="수학">수학</option>
                    <option value="과학">과학</option>
                    <option value="사회">사회</option>
                  </DropDown>
                </>
              )}
              {userType === "STUDENT" && (
                <>
                  <StudentInputArea>
                    <StudentInput>
                      <InputText>학년</InputText>
                      <MiniInput>
                        <input
                          type="number"
                          placeholder="예: 2"
                          value={studentGrade}
                          onChange={(e) => setStudentGrade(e.target.value)}
                        />
                      </MiniInput>
                    </StudentInput>
                    <StudentInput>
                      <InputText>반</InputText>
                      <MiniInput>
                        <input
                          type="number"
                          placeholder="예: 2"
                          value={studentClass}
                          onChange={(e) => setStudentClass(e.target.value)}
                        />
                      </MiniInput>
                    </StudentInput>
                    <StudentInput>
                      <InputText>번호</InputText>
                      <MiniInput>
                        <input
                          type="number"
                          placeholder="예: 10"
                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                        />
                      </MiniInput>
                    </StudentInput>
                  </StudentInputArea>
                </>
              )}
              <InputText>이름</InputText>
              <InputArea>
                <input
                  placeholder="홍길동"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </InputArea>
              <InputText>학교명</InputText>
              <InputArea style={{ position: "relative" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    left: "20",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  placeholder="학교명을 검색하세요"
                  type="text"
                  value={schoolQuery}
                  onChange={(e) => handleSchoolSearch(e.target.value)}
                  style={{ paddingLeft: "2rem" }}
                />
                {isDropdownOpen && schoolResults.length > 0 && (
                  <SchoolList>
                    {schoolResults.map((school) => (
                      <SchoolItem
                        key={school.schoolId}
                        onClick={() => handleSchoolSelect(school)}
                      >
                        {school.schoolName}
                      </SchoolItem>
                    ))}
                  </SchoolList>
                )}
              </InputArea>
              <InputText>아이디</InputText>
              <InputArea>
                <input
                  placeholder="example@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputArea>
              <InputText>비밀번호</InputText>
              <InputArea>
                <input
                  placeholder="사용할 비밀번호를 입력하세요"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="off"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <ToggleButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </ToggleButton>
              </InputArea>
              <InputText>비밀번호 확인</InputText>
              <InputArea>
                <input
                  placeholder="비밀번호 확인"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  autoComplete="off"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <ToggleButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </ToggleButton>
              </InputArea>
              <SignButton onClick={handleSignUp}>
                <p>회원가입</p>
              </SignButton>
            </form>
          </>
        );
      case "forgotPassword":
        return (
          <>
            <h1>비밀번호를 잊으셨나요?</h1>
            <InputText>이메일</InputText>
            <InputArea>
              <input
                placeholder="회원가입 시 등록한 이메일을 입력해주세요."
                type="email"
              />
            </InputArea>
            <SignButton>
              <p>비밀번호 재설정 메일 보내기</p>
            </SignButton>
          </>
        );
      case "additionalInfo":
        return (
          <>
            <Title>추가 정보 입력</Title>
            <DropDown
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="TEACHER">교사</option>
              <option value="PARENT">학부모</option>
              <option value="STUDENT">학생</option>
            </DropDown>
            {userType === "TEACHER" && (
              <>
                <InputText>담당 과목</InputText>
                <DropDown
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="국어">국어</option>
                  <option value="영어">영어</option>
                  <option value="수학">수학</option>
                  <option value="과학">과학</option>
                  <option value="사회">사회</option>
                </DropDown>
              </>
            )}
            {userType === "STUDENT" && (
              <>
                <StudentInputArea>
                  <StudentInput>
                    <InputText>학년</InputText>
                    <MiniInput>
                      <input
                        type="number"
                        placeholder="예: 2"
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(e.target.value)}
                      />
                    </MiniInput>
                  </StudentInput>
                  <StudentInput>
                    <InputText>반</InputText>
                    <MiniInput>
                      <input
                        type="number"
                        placeholder="예: 2"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                      />
                    </MiniInput>
                  </StudentInput>
                  <StudentInput>
                    <InputText>번호</InputText>
                    <MiniInput>
                      <input
                        type="number"
                        placeholder="예: 10"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                      />
                    </MiniInput>
                  </StudentInput>
                </StudentInputArea>
              </>
            )}
            <InputText>이름</InputText>
            <InputArea>
              <input
                placeholder="홍길동"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputArea>
            <InputText>학교명</InputText>
            <InputArea style={{ position: "relative" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: "absolute",
                  left: "20",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="학교명을 검색하세요"
                type="text"
                value={schoolQuery}
                onChange={(e) => handleSchoolSearch(e.target.value)}
                style={{ paddingLeft: "2rem" }}
              />
              {isDropdownOpen && schoolResults.length > 0 && (
                <SchoolList>
                  {schoolResults.map((school) => (
                    <SchoolItem
                      key={school.schoolId}
                      onClick={() => handleSchoolSelect(school)}
                    >
                      {school.schoolName}
                    </SchoolItem>
                  ))}
                </SchoolList>
              )}
            </InputArea>
            <SignButton onClick={handleSubmitKakaoInfo}>
              <p>회원가입 완료</p>'
            </SignButton>
          </>
        );
    }
  };

  const renderSecondaryArea = () => {
    switch (mode) {
      case "selectSignIn":
        return (
          <SecondaryArea>
            <div>
              <p>아직 계정이 없으신가요?</p>
              <a onClick={() => setMode("selectSignUp")}>회원가입</a>
            </div>
          </SecondaryArea>
        );
      case "signIn":
        return (
          <>
            <Line />
            <SecondaryArea>
              <div>
                <p>비밀번호를 잊으셨나요?</p>
                <a onClick={() => setMode("forgotPassword")}>비밀번호 찾기</a>
              </div>
              <div>
                <p>아직 계정이 없으신가요?</p>
                <a onClick={() => setMode("selectSignUp")}>회원가입</a>
              </div>
            </SecondaryArea>
          </>
        );
      case "selectSignUp":
        return (
          <SecondaryArea>
            <div>
              <p>이미 계정이 있으신가요?</p>
              <a onClick={() => setMode("selectSignIn")}>로그인 하기</a>
            </div>
          </SecondaryArea>
        );
      case "signUp":
        return (
          <>
            <Line />
            <SecondaryArea>
              <div>
                <p>이미 계정이 있으신가요?</p>
                <a onClick={() => setMode("selectSignIn")}>로그인 하기</a>
              </div>
            </SecondaryArea>
          </>
        );
      case "forgotPassword":
        return (
          <>
            <Line />
            <SecondaryArea>
              <div>
                <p>비밀번호가 기억나셨나요?</p>
                <a onClick={() => setMode("signIn")}>로그인 하기</a>
              </div>
            </SecondaryArea>
          </>
        );
    }
  };

  return (
    <div>
      <SplitScreen>
        <LeftCard>
          <WelcomeLogo src={Logo} />
        </LeftCard>
        <RightCard>
          <InnerContent>
            {renderForm()}

            {renderSecondaryArea()}
          </InnerContent>
        </RightCard>
      </SplitScreen>
    </div>
  );
};

export default SignInPage;
