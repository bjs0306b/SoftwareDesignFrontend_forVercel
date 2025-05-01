import React from "react";
import {
  Description,
  DescriptionArea,
  FeedbackArea,
  FeedbackContent,
  FeedbackTitle,
  Header,
  Line,
  MainContainer,
  TitleArea,
} from "./FeedbackReport.styled";

interface Student {
  studentId: number;
  name: string;
  grade: number;
  gradeClass: number;
  number: number;
  img: string;
}

interface FeedbackItem {
  GRADE: string;
  BEHAVIOR: string;
  ATTENDANCE: string;
  ATTITUDE: string;
}

interface FeedbackReportProps {
  student: Student;
  grade: string;
  feedbacks: FeedbackItem;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({
  student,
  grade,
  feedbacks,
}) => {
  return (
    <MainContainer>
      <Header>
        <p>
          {student.grade}학년 {student.gradeClass}반 {student.number}번
        </p>
        <TitleArea>
          <h1>{student.name} 학생</h1>
          <p>피드백 보고서</p>
        </TitleArea>
      </Header>
      <DescriptionArea>
        <Description>{grade}학년 피드백 내역</Description>
        <Line />
      </DescriptionArea>

      <FeedbackArea>
        <FeedbackTitle>성적</FeedbackTitle>
        <FeedbackContent>{feedbacks.GRADE || "내용 없음"}</FeedbackContent>
      </FeedbackArea>
      <FeedbackArea>
        <FeedbackTitle>행동</FeedbackTitle>
        <FeedbackContent>{feedbacks.BEHAVIOR || "내용 없음"}</FeedbackContent>
      </FeedbackArea>
      <FeedbackArea>
        <FeedbackTitle>출결</FeedbackTitle>
        <FeedbackContent>{feedbacks.ATTENDANCE || "내용 없음"}</FeedbackContent>
      </FeedbackArea>
      <FeedbackArea>
        <FeedbackTitle>태도</FeedbackTitle>
        <FeedbackContent>{feedbacks.ATTITUDE || "내용 없음"}</FeedbackContent>
      </FeedbackArea>
    </MainContainer>
  );
};

export default FeedbackReport;
