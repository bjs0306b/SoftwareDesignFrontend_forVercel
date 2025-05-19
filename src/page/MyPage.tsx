import React, { useState } from "react";
import {
  ChangeButton,
  CloseButton,
  InputArea,
  Line,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  TitleArea,
  ToggleButton,
  FileButton,
  PreviewImg,
  ImageArea,
  KakaoButton,
  CreateButton,
} from "./MyPage.styled";
import { useAuthStore } from "../stores/authStore";
import axios from "../api/axiosInstance.ts";
import { FiEye, FiEyeOff } from "react-icons/fi";
const DEFAULT_IMAGE_URL = "/assets/img/photo.png";

interface MyPageProps {
  onClose: () => void;
}

const MyPage: React.FC<MyPageProps> = ({ onClose }) => {
  const role = useAuthStore((state) => state.role);
  //비밀번호 변경용
  const schoolId = useAuthStore((state) => state.schoolId);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  //이미지 업로드용
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(DEFAULT_IMAGE_URL);

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

  const handleUpload = async () => {
    const isImageChanged = previewUrl !== DEFAULT_IMAGE_URL;

    if (!isImageChanged) {
      alert("사진이 변경되지 않았습니다.");
      return;
    }

    const formData = new FormData();
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

      alert("사진이 성공적으로 변경되었습니다.");
      window.location.reload();
    } catch (err) {
      console.error("사진 변경 실패:", err);
    }
  };

  const handleKakaoLogin = () => {
    window.location.href =
      "http://3.38.130.125:3000/api/v1/auth/kakao/connect/callback";
  };

  return (
    <Overlay data-testid="mypage-overlay" onClick={onClose}>
      <ModalContainer
        data-testid="mypage-modal"
        onClick={(e) => e.stopPropagation()}
      >
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
        {role === "STUDENT" && (
          <Section data-testid="photo-section">
            <SectionTitle>사진 변경</SectionTitle>
            <Line />
            <label>사진</label>
            <ImageArea>
              <input
                data-testid="file-input"
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
            <ChangeButton data-testid="upload-button" onClick={handleUpload}>
              사진 변경
            </ChangeButton>
          </Section>
        )}
        <Section data-testid="password-section">
          <SectionTitle>비밀번호 변경</SectionTitle>
          <Line />
          <label>기존 비밀번호</label>
          <InputArea>
            <input
              data-testid="input-current-password"
              type={showPassword ? "text" : "password"}
              placeholder="영문+숫자"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <ToggleButton
              data-testid="password-toggle-visibility"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </ToggleButton>
          </InputArea>
          <label>변경 비밀번호</label>
          <InputArea>
            <input
              data-testid="input-new-password"
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
              data-testid="input-confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="영문+숫자"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <ToggleButton onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </ToggleButton>
          </InputArea>
          {passwordError && <p data-testid="password-error">{passwordError}</p>}
          <ChangeButton
            data-testid="password-change-button"
            onClick={handlePasswordChange}
          >
            비밀번호 변경
          </ChangeButton>
        </Section>
        <Section data-testid="kakao-section">
          <SectionTitle>카카오 계정 연동</SectionTitle>
          <Line />
          <KakaoButton data-testid="kakao-button" onClick={handleKakaoLogin}>
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
            <div>카카오 계정 연동</div>
          </KakaoButton>
        </Section>
        {role === "STUDENT" && (
          <Section data-testid="parent-section">
            <SectionTitle>학부모 계정 생성</SectionTitle>
            <Line />
            <CreateButton data-testid="parent-create-button">
              학부모 계정 생성
            </CreateButton>
          </Section>
        )}
      </ModalContainer>
    </Overlay>
  );
};

export default MyPage;
