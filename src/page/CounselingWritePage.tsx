import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

interface Post {
  consultationId: number;
  studentId: number;
  teacherId: number;
  date: string;
  isPublicToSubject: boolean;
  content: string;
  nextPlan: string;
  title: string;
  subject: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationState {
  post: Post;
  viewOnly: boolean;
}

import {
  CounselingWriteContainer,
  CounselingWriteHeader,
  Line,
  Container,
  Header,
  TitleInput,
  PrivacySection,
  CheckboxLabel,
  Checkbox,
  ContentArea,
  ButtonGroup,
  SaveButton,
  CancelButton,
  DateInput,
  DateLabel,
  DateSection,
} from "./CounselingWritePage.styled";
import { useAuthStore } from "../stores/authStore";
import { useStudentStore } from "../stores/studentStore";

const CounselingWritePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || { viewOnly: false };
  const post = state.post;
  const viewOnly = state.viewOnly || false;
  const selectedStudent = useStudentStore((state) => state.selectedStudent);
  const schoolId = useAuthStore((state) => state.schoolId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [nextCounselingDate, setNextCounselingDate] = useState("");

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // 'yyyy-MM-dd' 형식으로 변환
  };

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setIsPrivate(post.isPublicToSubject || false);
      setNextCounselingDate(formatDate(post.nextPlan) || ""); // 날짜 변환
    }
  }, [post]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !nextCounselingDate) {
      alert("제목, 내용, 다음 상담 기간을 모두 입력해주세요.");
      return;
    }
    // 날짜 형식 변환
    const formatDateForAPI = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString();
    };

    const requestData = {
      title,
      content,
      date: formatDateForAPI(new Date().toISOString()), // 현재 날짜 사용 (상담 작성일)
      nextPlan: formatDateForAPI(nextCounselingDate), // 사용자가 입력한 '다음 상담 기간'
      isPublicToSubject: isPrivate, // 체크박스 상태
    };

    try {
      const token = sessionStorage.getItem("accessToken"); // 토큰 가져오기
      console.log(selectedStudent?.studentId);
      const response = await axios.post(
        `/api/v1/school/${schoolId}/consultation/students/${selectedStudent?.studentId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("상담 기록 저장 성공:", response.data);
      handleGoBack();
    } catch (err) {
      console.error("상담 기록 저장 실패:", err);
      // 실패 시 처리, 예: 사용자에게 에러 메시지 표시
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <CounselingWriteContainer>
      <CounselingWriteHeader>상담 내역</CounselingWriteHeader>
      <Line />
      <Container>
        <Header>
          <TitleInput
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={viewOnly}
          />

          <DateSection>
            <DateLabel>다음 상담 기간</DateLabel>
            <DateInput
              type="date"
              value={nextCounselingDate}
              onChange={(e) => setNextCounselingDate(e.target.value)}
              disabled={viewOnly}
            />
          </DateSection>

          <PrivacySection>
            <CheckboxLabel>
              <strong>동일 과목 교사에게만 공개</strong>
              <Checkbox
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
                disabled={viewOnly}
              />
            </CheckboxLabel>
          </PrivacySection>
        </Header>

        <ContentArea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={viewOnly}
        />

        <ButtonGroup>
          <CancelButton
            data-testid="counseling-cancel-button"
            onClick={handleGoBack}
          >
            취소
          </CancelButton>
          {!viewOnly && (
            <SaveButton
              data-testid="counseling-save-button"
              onClick={handleSubmit}
            >
              저장
            </SaveButton>
          )}
        </ButtonGroup>
      </Container>
    </CounselingWriteContainer>
  );
};

export default CounselingWritePage;
