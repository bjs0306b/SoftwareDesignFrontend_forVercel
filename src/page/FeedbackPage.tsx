import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { useStudentStore } from "../stores/studentStore";

import {
  FeedbackContainer,
  FeedbackHeader,
  Line,
  FeedbackContentContainer,
  ContentBox,
  ContentTitle,
  ContentForm,
  ButtonContainer,
  SendButton,
  EditButton,
  GradeSelect,
  GuideMessage,
} from "./FeedbackPage.styled";

//props 수정
interface FeedbackItem {
  schoolYear: number;
  category: "GRADE" | "BEHAVIOR" | "ATTENDANCE" | "ATTITUDE";
  content: string;
  updatedAt: string;
}

const FeedbackPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [feedbacks, setFeedbacks] = useState({
    GRADE: "",
    BEHAVIOR: "",
    ATTENDANCE: "",
    ATTITUDE: "",
  });
  const selectedStudent = useStudentStore((state) => state.selectedStudent);
  const role = useAuthStore((state) => state.role);
  const schoolId = useAuthStore((state) => state.schoolId);
  const [schoolYear, setSchoolYear] = useState("1");  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 편집 모드 진입 시 모든 폼이 비어있는지 여부를 저장
  const [isAllEmptyOnEditStart, setIsAllEmptyOnEditStart] = useState(true);

  // 기존 fetchFeedbackData 함수 (변경 없음)
  const fetchFeedbackData = useCallback(async () => {
    if (!selectedStudent) return;

    setIsLoading(true);
    setError(null);

    const token = sessionStorage.getItem("accessToken");
    if (!token || !schoolId) return;

    try {
      const response = await axios.get(
        `/api/v1/school/${schoolId}/feedback/students/${selectedStudent.studentId}?schoolYear=${schoolYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 200) {
        const newFeedbacks = {
          GRADE: "",
          BEHAVIOR: "",
          ATTENDANCE: "",
          ATTITUDE: "",
        };

        response.data.data.forEach((item: FeedbackItem) => {
          newFeedbacks[item.category] = item.content;
        });

        setFeedbacks(newFeedbacks);
      } else {
        setError("피드백 데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("피드백 데이터 조회 중 오류 발생:", err);
      setError("피드백 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudent, schoolId, schoolYear]);

  useEffect(() => {
    if (selectedStudent) {
      fetchFeedbackData();
    }
  }, [selectedStudent, schoolYear, fetchFeedbackData]);

  const handleChange =
    (field: keyof typeof feedbacks) =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFeedbacks({
        ...feedbacks,
        [field]: e.target.value,
      });
      // console.log(feedbacks);
    };

  const toggleEditMode = async () => {
    if (isEditing) {
      // 저장 버튼을 눌렀을 때
      if (!selectedStudent || !schoolId) return;

      setIsLoading(true);
      setError(null);

      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        setError("인증 토큰이 없습니다.");
        setIsLoading(false);
        return;
      }

      // 피드백 데이터 준비
      const feedbackData = [
        { category: "GRADE", content: feedbacks.GRADE },
        { category: "BEHAVIOR", content: feedbacks.BEHAVIOR },
        { category: "ATTENDANCE", content: feedbacks.ATTENDANCE },
        { category: "ATTITUDE", content: feedbacks.ATTITUDE },
      ];

      try {
        // 인증 토큰을 포함한 헤더 설정
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        let response;

        if (isAllEmptyOnEditStart) {
          // 경우 1: 편집 모드 진입 시 모든 폼이 비어있음 - POST 요청
          console.log(Array.isArray(feedbackData));
          response = await axios.post(
            `/api/v1/school/${schoolId}/feedback/students/${selectedStudent.studentId}?schoolYear=${schoolYear}`,
            { feedbacks: feedbackData },
            config
          );
          // console.log("피드백 저장 응답:", response.data);
        } else {
          // 경우 2: 편집 모드 진입 시 하나 이상의 폼이 채워져 있음 - PATCH 요청
         
          response = await axios.patch(
            `/api/v1/school/${schoolId}/feedback/students/${selectedStudent.studentId}?schoolYear=${schoolYear}`,
            { feedbacks: feedbackData },
            config
          );
        }
        console.log("피드백 저장 응답:", response.data);

        // 응답 처리
        if (response.data.status === 201 || response.data.status === 200) {
          // 저장 성공 후 피드백 데이터 새로고침
          await fetchFeedbackData();
        } else {
          setError("피드백 저장에 실패했습니다.");
        }
      } catch (err) {
        console.error("피드백 저장 중 오류 발생:", err);
        setError("피드백 저장에 실패했습니다.");
      } finally {
        setIsLoading(false);
        setIsEditing(false);
      }
    } else {
      // 수정 버튼을 눌렀을 때
      // 모든 폼이 비어있는지 확인
      const isAllEmpty = Object.values(feedbacks).every(
        (value) => !value.trim()
      );
      setIsAllEmptyOnEditStart(isAllEmpty);
      setIsEditing(true);
    }
  };

  const handleSendToStudent = async () => {
    if (!selectedStudent) return;

    try {
      // 학생에게 피드백 전송 API 호출 로직 (추후 구현)
      console.log("학생에게 피드백 전송:", feedbacks);
      // 예시: await axios.post(`/api/v1/school/${schoolId}/feedback/students/${selectedStudent.studentId}/send`, { feedbacks, target: 'student' });
    } catch (err) {
      console.error("학생에게 피드백 전송 중 오류 발생:", err);
    }
  };

  const handleSendToParent = async () => {
    if (!selectedStudent) return;

    try {
      // 학부모에게 피드백 전송 API 호출 로직 (추후 구현)
      console.log("학부모에게 피드백 전송:", feedbacks);
      // 예시: await axios.post(`/api/v1/school/${schoolId}/feedback/students/${selectedStudent.studentId}/send`, { feedbacks, target: 'parent' });
    } catch (err) {
      console.error("학부모에게 피드백 전송 중 오류 발생:", err);
    }
  };

  return (
    <FeedbackContainer>
      <FeedbackHeader>피드백 내역</FeedbackHeader>
      <Line />
      {selectedStudent || !(role === "TEACHER") ? (
        <>
          <GradeSelect
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
          >
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
          </GradeSelect>

          {isLoading ? (
            <GuideMessage>데이터를 불러오는 중입니다...</GuideMessage>
          ) : error ? (
            <GuideMessage>{error}</GuideMessage>
          ) : (
            <FeedbackContentContainer>
              <ContentBox role={role}>
                <ContentTitle>성적</ContentTitle>
                <ContentForm
                  value={feedbacks.GRADE}
                  data-testid="feedback-form-grade"
                  onChange={handleChange("GRADE")}
                  disabled={!isEditing}
                  placeholder={
                    isEditing ? "성적에 대한 피드백을 입력하세요" : ""
                  }
                  role={role}
                />
              </ContentBox>

              <ContentBox role={role}>
                <ContentTitle>행동</ContentTitle>
                <ContentForm
                  value={feedbacks.BEHAVIOR}
                  data-testid="feedback-form-behavior"
                  onChange={handleChange("BEHAVIOR")}
                  disabled={!isEditing}
                  placeholder={
                    isEditing ? "행동에 대한 피드백을 입력하세요" : ""
                  }
                  role={role}
                />
              </ContentBox>

              <ContentBox role={role}>
                <ContentTitle>출결</ContentTitle>
                <ContentForm
                  value={feedbacks.ATTENDANCE}
                  data-testid="feedback-form-attendance"
                  onChange={handleChange("ATTENDANCE")}
                  disabled={!isEditing}
                  placeholder={
                    isEditing ? "출결에 대한 피드백을 입력하세요" : ""
                  }
                  role={role}
                />
              </ContentBox>

              <ContentBox role={role}>
                <ContentTitle>태도</ContentTitle>
                <ContentForm
                  value={feedbacks.ATTITUDE}
                  data-testid="feedback-form-attitude"
                  onChange={handleChange("ATTITUDE")}
                  disabled={!isEditing}
                  placeholder={
                    isEditing ? "태도에 대한 피드백을 입력하세요" : ""
                  }
                  role={role}
                />
              </ContentBox>
            </FeedbackContentContainer>
          )}

          {role === "TEACHER" && !error && (
            <ButtonContainer>
              <div>
                <SendButton
                  onClick={handleSendToStudent}
                  disabled={isEditing || isLoading}
                >
                  학생 전송
                </SendButton>
                <SendButton
                  onClick={handleSendToParent}
                  disabled={isEditing || isLoading}
                >
                  학부모 전송
                </SendButton>
              </div>
              <EditButton onClick={toggleEditMode} disabled={isLoading}>
                {isEditing ? "저장" : "수정"}
              </EditButton>
            </ButtonContainer>
          )}
        </>
      ) : (
        <GuideMessage>
          좌측 검색창에서 성적을 조회할 학생을 검색하세요.
        </GuideMessage>
      )}
    </FeedbackContainer>
  );
};

export default FeedbackPage;
