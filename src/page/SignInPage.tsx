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
  InputText,
  Line,
  SchoolList,
  SchoolItem,
  ToggleButton,
  EmailButton,
  KakaoButton,
  Title,
} from "./SignInPage.styled";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdOutlineMail } from "react-icons/md";
import { useAuthStore } from "../stores/authStore";
import { PasswordTitle } from "./MyPage.styled";

interface School {
  schoolId: number;
  schoolName: string;
}

const SignInPage: React.FC = () => {
  const [mode, setMode] = useState<
    | "selectSignIn"
    | "signIn"
    | "forgotPassword"
    | "verification"
    | "resetPassword"
  >("selectSignIn");
  const navigate = useNavigate();
  const location = useLocation();
  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolResults, setSchoolResults] = useState<School[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

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
        loginId: loginEmail,
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

  const handleKakaoLogin = () => {
    window.location.href = "http://3.38.130.125:3000/api/v1/auth/kakao/sign-in";
  };

  //카카오 리디렉션 후 전역 상태 세팅 및 추가정보 분기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const schoolId = params.get("schoolId");
    const classId = params.get("classId");

    if (accessToken && refreshToken) {
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      if (schoolId) sessionStorage.setItem("schoolId", schoolId);
      if (classId) sessionStorage.setItem("classId", classId);

      setAuthTokens(accessToken, refreshToken);
      if (schoolId) setSchoolAndClass(Number(schoolId), Number(classId) || 0);
      navigate("/main");
    }
  }, [location.search, navigate, setAuthTokens, setSchoolAndClass]);

  //인증코드 발송
  const SendVerificationCode = async () => {
    try {
      await axios.get(`/api/v1/email/code`, {
        params: { email },
      });
      alert("인증 코드가 이메일로 전송되었습니다.");
      setMode("verification");
    } catch (err) {
      console.error("인증 코드 발송 실패", err);
      alert("인증 코드 발송에 실패했습니다.");
    }
  };

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
      case "forgotPassword":
        return (
          <>
            <PasswordTitle>
              보안을 위해 비밀번호를
              <br />
              재설정해주세요
            </PasswordTitle>
            <InputText>이메일</InputText>
            <InputArea>
              <input
                placeholder="회원가입 시 등록한 이메일을 입력해주세요."
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputArea>
            <SignButton onClick={() => SendVerificationCode()}>
              <p>비밀번호 재설정 메일 전송</p>
            </SignButton>
          </>
        );
      case "verification":
        return (
          <>
            <PasswordTitle>
              이메일로 전송된 인증 번호를
              <br />
              입력해주세요
            </PasswordTitle>
            <InputText>인증번호</InputText>
            <InputArea>
              <input
                placeholder="인증번호 6자리"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </InputArea>
            <SignButton onClick={() => setMode("resetPassword")}>
              <p>인증하기</p>
            </SignButton>
          </>
        );
      case "resetPassword":
        return (
          <>
            <PasswordTitle>
              보안을 위해 비밀번호를
              <br />
              재설정해주세요
            </PasswordTitle>
            <InputText>변경 비밀번호</InputText>
            <InputArea>
              <input
                placeholder="비밀번호를 입력하세요"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="off"
                onChange={(e) => setPassword(e.target.value)}
              />
              <ToggleButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </ToggleButton>
            </InputArea>
            <InputText>변경 비밀번호 확인</InputText>
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
            <SignButton onClick={() => setMode("resetPassword")}>
              <p>비밀번호 재설정</p>
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
              <p>비밀번호를 잊으셨나요?</p>
              <a onClick={() => setMode("forgotPassword")}>비밀번호 찾기</a>
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
