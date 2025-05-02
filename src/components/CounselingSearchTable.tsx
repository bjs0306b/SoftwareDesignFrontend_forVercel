import React from "react";
import {
  BoardTable,
  TableHeader,
  TableRow,
  TableCell,
  TitleCell,
} from "../page/CounselingPage.styled";

interface CounselingItem {
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

interface CounselingProps {
  data: CounselingItem[];
  onSelect: (counseling: CounselingItem) => void;
}

const CounselingSearchTable: React.FC<CounselingProps> = ({
  data,
  onSelect,
}) => {
  if (!data.length) return null;

  return (
    <BoardTable>
      <thead>
        <TableRow>
          <TableHeader width="3rem">번호</TableHeader>
          <TableHeader width="40rem">제목</TableHeader>
          <TableHeader width="10rem">작성자</TableHeader>
          <TableHeader width="5rem">담당과목</TableHeader>
          <TableHeader width="13rem">상담일자</TableHeader>
        </TableRow>
      </thead>
      <tbody>
        {data.map((post, index) => (
          <TableRow
            key={post.consultationId}
            onClick={() => onSelect(post)}
            style={{ cursor: "pointer" }}
          >
            <TableCell isBold>{index + 1}</TableCell>
            <TitleCell>{post.title}</TitleCell>
            <TableCell>{post.author}</TableCell>
            <TableCell>{post.subject}</TableCell>
            <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </BoardTable>
  );
};

export default CounselingSearchTable;
