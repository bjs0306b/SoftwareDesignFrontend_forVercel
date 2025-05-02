import React from "react";
import {
  CouncelingArea,
  CouncelingContent,
  CouncelingTitle,
  Description,
  DescriptionArea,
  Header,
  Line,
  MainContainer,
  TitleArea,
} from "./CounselingReport.styled";

interface Student {
  studentId: number;
  name: string;
  grade: number;
  gradeClass: number;
  number: number;
  img: string;
}

interface ConsultationItem {
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

interface CouncelingReportProps {
  student: Student;
  data: ConsultationItem[];
}

const CouncelingReport: React.FC<CouncelingReportProps> = ({
  student,
  data,
}) => {
  return (
    <MainContainer>
      <Header>
        <p>
          {student.grade}학년 {student.gradeClass}반 {student.number}번
        </p>
        <TitleArea>
          <h1>{student.name} 학생</h1>
          <p>상담 내역 보고서</p>
        </TitleArea>
      </Header>
      {data.map((consult: ConsultationItem) => (
        <React.Fragment key={consult.consultationId}>
          <DescriptionArea>
            <Description>
              {new Date(consult.date).toLocaleDateString("ko-KR")} 상담 내역
            </Description>
            <Line />
          </DescriptionArea>
          <CouncelingArea>
            <CouncelingTitle>
              <h3>제목: {consult.title}</h3>
              <p>담당자: {consult.author}</p>
            </CouncelingTitle>
            <CouncelingContent>{consult.content}</CouncelingContent>
          </CouncelingArea>
        </React.Fragment>
      ))}
    </MainContainer>
  );
};

export default CouncelingReport;
