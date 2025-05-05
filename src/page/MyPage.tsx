import React, { useEffect, useRef, useState } from "react";
import {
  ChangeButton,
  CloseButton,
  DropDown,
  DropdownBox,
  InfoRow,
  InputArea,
  Line,
  ModalContainer,
  Overlay,
  SchoolItem,
  SchoolList,
  Section,
  SectionTitle,
  TitleArea,
  ToggleButton,
  FileButton,
  PreviewImg,
  ImageArea,
} from "./MyPage.styled";
import { useAuthStore } from "../stores/authStore";
import axios from "../api/axiosInstance.ts";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
const DEFAULT_IMAGE_URL = "/assets/img/photo.png";

interface School {
  schoolId: number;
  schoolName: string;
}

interface MyPageProps {
  onClose: () => void;
}

const MyPage: React.FC<MyPageProps> = ({ onClose }) => {
  const role = useAuthStore((state) => state.role);
  const isHomeroom = useAuthStore((state) => state.isHomeroom);
  const setIsHomeroom = useAuthStore((state) => state.setIsHomeroom);
  const schoolName = useAuthStore((state) => state.schoolName);
  const schoolId = useAuthStore((state) => state.schoolId);
  const [selectedGrade, setSelectedGrade] = useState("1");
  const [selectedClass, setSelectedClass] = useState("1");
  const userName = useAuthStore((state) => state.userName);
  const [name, setName] = useState(userName);
  const navigate = useNavigate();

  const handleUpdateUserInfo = async () => {
    const prevName = useAuthStore.getState().userName;
    const prevSchoolName = useAuthStore.getState().schoolName;

    // 공백 제거한 현재 값
    const trimmedName = name.trim();
    const trimmedSchool = selectedSchool.trim();

    // 변경 여부 판단 (빈 문자열 포함)
    const isNameChanged = trimmedName && trimmedName !== prevName.trim();
    const isSchoolChanged =
      trimmedSchool && trimmedSchool !== prevSchoolName.trim();
    const isImageChanged = previewUrl !== DEFAULT_IMAGE_URL;

    // 변경된 정보가 전혀 없을 때
    if (!isNameChanged && !isSchoolChanged && !isImageChanged) {
      alert("변경된 정보가 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName || prevName);
    formData.append("schoolName", trimmedSchool || prevSchoolName);

    //학생일 때 프로필 추가
    if (role === "STUDENT" && isImageChanged && selectedImage) {
      formData.append("profile", selectedImage);
    }

    try {
      const response = await axios.patch(
        `/school/${schoolId}/users/me`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status !== 200) return;

      if (isSchoolChanged) {
        alert("학교가 변경되었습니다. 다시 로그인해주세요.");
        await handleLogout();
        return;
      }

      alert("내 정보가 성공적으로 수정되었습니다.");
      window.location.reload();
    } catch (err) {
      console.error("내 정보 수정 실패:", err);
    }
  };

  const handleLogout = async () => {
    try {
      if (!schoolId) return;

      const response = await axios.post(`/auth/sign-out`, {});
      console.log("로그아웃 성공:", response.data);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  };

  const [localIsHomeroom, setLocalIsHomeroom] = useState(isHomeroom);
  const handleHomeroom = () => {
    setIsHomeroom(localIsHomeroom);
    alert("담임 권한이 설정되었습니다.");
  };
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("모든 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axios.patch(`/school/${schoolId}/users/password`, {
        currentPassword,
        newPassword,
      });

      if (response.data.status === 200) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        console.log("응답 결과:", response.data);
      }
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
    }
  };

  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolResults, setSchoolResults] = useState<School[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        const response = await axios.get("/school", {
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

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(DEFAULT_IMAGE_URL);

  // 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setPreviewUrl(DEFAULT_IMAGE_URL);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <TitleArea>
          <h2>마이페이지</h2>
          <CloseButton onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M19.9993 22.3334L11.8327 30.5001C11.5271 30.8056 11.1382 30.9584 10.666 30.9584C10.1938 30.9584 9.8049 30.8056 9.49935 30.5001C9.19379 30.1945 9.04102 29.8056 9.04102 29.3334C9.04102 28.8612 9.19379 28.4723 9.49935 28.1667L17.666 20.0001L9.49935 11.8334C9.19379 11.5279 9.04102 11.139 9.04102 10.6667C9.04102 10.1945 9.19379 9.80564 9.49935 9.50008C9.8049 9.19453 10.1938 9.04175 10.666 9.04175C11.1382 9.04175 11.5271 9.19453 11.8327 9.50008L19.9993 17.6667L28.166 9.50008C28.4716 9.19453 28.8605 9.04175 29.3327 9.04175C29.8049 9.04175 30.1938 9.19453 30.4993 9.50008C30.8049 9.80564 30.9577 10.1945 30.9577 10.6667C30.9577 11.139 30.8049 11.5279 30.4993 11.8334L22.3327 20.0001L30.4993 28.1667C30.8049 28.4723 30.9577 28.8612 30.9577 29.3334C30.9577 29.8056 30.8049 30.1945 30.4993 30.5001C30.1938 30.8056 29.8049 30.9584 29.3327 30.9584C28.8605 30.9584 28.4716 30.8056 28.166 30.5001L19.9993 22.3334Z"
                fill="black"
              />
            </svg>
          </CloseButton>
        </TitleArea>
        <Line />
        <Section>
          <SectionTitle>개인정보</SectionTitle>
          <Line />
          {role === "STUDENT" && (
            <>
              <label>사진</label>
              <ImageArea>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                {previewUrl && <PreviewImg src={previewUrl} alt="미리보기" />}
                <FileButton
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  파일 선택
                </FileButton>
              </ImageArea>
            </>
          )}
          <label>성명</label>
          <InputArea>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </InputArea>
          <label>학교명</label>
          <InputArea style={{ position: "relative" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
              placeholder={schoolName}
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
          <ChangeButton onClick={handleUpdateUserInfo}>
            개인정보 변경
          </ChangeButton>
          {role === "TEACHER" && (
            <>
              <SectionTitle>담임교사 권한 설정</SectionTitle>
              <Line />
              <InfoRow>
                담임교사 여부
                <input
                  type="checkbox"
                  checked={localIsHomeroom}
                  onChange={(e) => setLocalIsHomeroom(e.target.checked)}
                />
              </InfoRow>
              <DropdownBox>
                <DropDown
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </DropDown>
                <DropDown
                  id="semester"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="1">1반</option>
                  <option value="2">2반</option>
                  <option value="3">3반</option>
                  <option value="4">4반</option>
                  <option value="5">5반</option>
                  <option value="6">6반</option>
                </DropDown>
              </DropdownBox>
              <ChangeButton onClick={handleHomeroom}>
                담임권한 설정
              </ChangeButton>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>비밀번호 변경</SectionTitle>
          <Line />
          <label>기존 비밀번호</label>
          <InputArea>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="영문+숫자"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <ToggleButton onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </ToggleButton>
          </InputArea>
          <label>변경 비밀번호</label>
          <InputArea>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="영문+숫자"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <ToggleButton onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </ToggleButton>
          </InputArea>
          <label>변경 비밀번호 확인</label>
          <InputArea>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="영문+숫자"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <ToggleButton onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </ToggleButton>
          </InputArea>
          {passwordError && <p>{passwordError}</p>}
          <ChangeButton onClick={handlePasswordChange}>
            비밀번호 변경
          </ChangeButton>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default MyPage;
