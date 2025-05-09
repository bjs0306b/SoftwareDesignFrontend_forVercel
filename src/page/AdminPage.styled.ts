// page/AdminPage.styled.ts
import styled from "styled-components";

export const PageWrapper = styled.div`
  width: 112rem;
  height: 53.5rem;
  border-radius: 0 0 1.25rem 1.25rem;
  border: 1px solid #000;
  display: flex;
  flex-direction: row;
  background: #fff;
`;

/* 좌측 학급 목록 */
export const ClassListWrapper = styled.aside`
  width: 10rem;
  border-right: 1px solid #b9b9b9;
  padding: 2rem 1rem;
  overflow-y: auto;

  h2 {
    margin: 0 0 1rem 0;
    font-family: "Inter";
    font-size: 1.25rem;
    font-weight: 700;
  }
`;

export const ClassItem = styled.div<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#004260" : "#146C94")};
  color: #fff;
  font-family: "Inter";
  font-size: 0.875rem;

  &:hover {
    background: ${({ $active }) => ($active ? "#004260" : "#0c5473")};
  }
`;

/* 우측 메인 콘텐츠 */
export const MainWrapper = styled.section`
  flex: 1;
  padding: 2rem 3rem;
  overflow-y: auto;
`;

export const ClassTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-family: "Inter";
  font-size: 1.5rem;
  font-weight: 700;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const TeacherBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  span {
    font-family: "Inter";
    font-size: 1rem;
    font-weight: 600;
  }

  select {
    padding: 0.25rem 0.5rem;
    font-family: "Inter";
    font-size: 1rem;
  }
`;

export const StudentTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #b9b9b9;
    padding: 0.5rem;
    text-align: center;
    font-family: "Inter";
    font-size: 0.875rem;
  }

  th {
    background: #146c94;
    color: #fff;
  }
`;

export const AssignButton = styled.button`
  width: 2rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.375rem;
  background: #146c94;
  color: #fff;
  font-family: "Inter";
  font-size: 0.875rem;
  cursor: pointer;
  &:hover { background: #004260; }
`;


export const ListRow = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
`;

export const ScrollBox = styled.div`
  max-height: 22rem;
  overflow-y: auto;
`;

export const SaveButton = styled.button`
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  background: #004260;
  color: #fff;
  font-family: "Inter";
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #002d40;
  }

  &:disabled {
    background: #9ca3af;
    cursor: default;
  }
`;
