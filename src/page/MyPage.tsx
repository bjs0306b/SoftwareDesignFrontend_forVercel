import React, { useState } from "react";
import {
  ChangeButton,
  CloseButton,
  DropDown,
  DropdownBox,
  InfoRow,
  Input,
  InputArea,
  Line,
  ModalContainer,
  Overlay,
  SchoolInput,
  SchoolItem,
  SchoolList,
  Section,
  SectionTitle,
  TitleArea,
  ToggleButton,
} from "./MyPage.styled";
import { useAuthStore } from "../stores/authStore";
import axios from "../api/axiosInstance.ts";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
  const handleSaveInfo = () => {
    setIsHomeroom(localIsHomeroom);
    alert("개인정보가 변경되었습니다.");
  };
  const [localIsHomeroom, setLocalIsHomeroom] = useState(isHomeroom);
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

  const allSchools = [
    "서울고등학교",
    "부산고등학교",
    "대구중학교",
    "인천중학교",
    "광주고등학교",
    "대전중학교",
    "울산중학교",
  ];

  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(schoolName);
  const [schoolResults, setSchoolResults] = useState<string[]>([]);
  const handleSchoolSearch = (query: string) => {
    setSchoolQuery(query);
    if (query.length > 0) {
      const filteredSchools = allSchools.filter((school) =>
        school.toLowerCase().includes(query.toLowerCase())
      );
      setSchoolResults(filteredSchools);
    } else {
      setSchoolResults([]);
    }
  };

  const handleSchoolSelect = (school: string) => {
    setSelectedSchool(school);
    setSchoolQuery(school);
    setSchoolResults([]);
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
          <label>성명</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>학교명</label>
          <SchoolInput
            placeholder={selectedSchool}
            type="text"
            value={schoolQuery}
            onChange={(e) => handleSchoolSearch(e.target.value)}
          />
          {schoolResults.length > 0 && (
            <SchoolList>
              {schoolResults.map((school) => (
                <SchoolItem
                  key={school}
                  onClick={() => handleSchoolSelect(school)}
                >
                  {school}
                </SchoolItem>
              ))}
            </SchoolList>
          )}
          {role === "TEACHER" && (
            <>
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
            </>
          )}
          <ChangeButton onClick={handleSaveInfo}>개인정보 변경</ChangeButton>
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
