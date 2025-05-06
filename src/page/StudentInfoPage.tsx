import React from "react";
import {
  StdInfoContainer,
  StdInfoHeader,
  StdInfoContent,
  Line,
  GuideMessage,
  Table,
  TableRow,
  HeaderCell,
  DataCell,
} from "./StudentInfoPage.styled";
import { useAuthStore } from "../stores/authStore";
import { useStudentStore } from "../stores/studentStore";

const StudentInfoPage: React.FC = () => {
  const role = useAuthStore((state) => state.role);
  const selectedStudent = useStudentStore((state) => state.selectedStudent);
  return (
    <StdInfoContainer>
      <StdInfoHeader>학생 정보</StdInfoHeader>
      <Line />
      {role === "TEACHER" && !selectedStudent ? (
        <GuideMessage>
          좌측 검색창에서 성적을 조회할 학생을 검색하세요.
        </GuideMessage>
      ) : (
        <StdInfoContent>
          <Table>
            <TableRow>
              <HeaderCell>전화번호</HeaderCell>
              <DataCell>010-1234-5678</DataCell>
            </TableRow>
            <TableRow>
              <HeaderCell>집주소</HeaderCell>
              <DataCell>인천광역시 연수구 신송로 312-1</DataCell>
            </TableRow>
            <TableRow>
              <HeaderCell>부모님 연락처</HeaderCell>
              <DataCell>010-1234-5678</DataCell>
            </TableRow>
          </Table>
        </StdInfoContent>
      )}
    </StdInfoContainer>
  );
};

export default StudentInfoPage;
