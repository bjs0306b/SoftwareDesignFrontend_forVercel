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

export const ClassListWrapper = styled.aside`
  width: 10rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #b9b9b9;
  padding: 2rem 1rem 1rem;

  h2 {
    margin: 0 0 1rem 0;
    font-family: "Inter";
    font-size: 1.55rem;
    font-weight: 700;
    text-align: center;
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
    padding: 0.625rem;
    text-align: center;
    font-family: "Inter";
    font-size: 0.9rem;
  }

  th {
    background: #146c94;
    color: #fff;
  }
`;

export const AssignButton = styled.button`
  width: 2rem;
  height: 1.9rem;
  border: none;
  border-radius: 0.375rem;
  background: #146c94;
  color: #fff;
  font-family: "Inter";
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    background: #004260;
  }
`;

export const ListRow = styled.div`
  margin-left: 17rem;
  display: flex;
  gap: 10rem;
  align-items: flex-start;
`;

export const ScrollBox = styled.div`
  max-height: 22rem;

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

export const DropdownRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

export const CategorySelect = styled.select`
  height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid #b9b9b9;
  border-radius: 0.375rem;
  background: #fff;
  font-family: "Inter";
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: 2px solid #146c94;
  }
`;

export const TableSearchInput = styled.input`
  width: 95%;
  height: 2rem;
  margin: 0.25rem 0 0.75rem;
  padding: 0 0.6rem;
  border: 1px solid #b9b9b9;
  border-radius: 0.375rem;
  font-family: "Inter";
  font-size: 0.875rem;
`;

export const AddClassButton = styled.button`
  width: 100%;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  background: #146c94;
  color: #fff;
  font-family: "Inter";
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #004260;
  }
`;

export const AddClassForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

export const AddClassInputRow = styled.div`
  display: flex;
  gap: 0.375rem;
`;

export const AddClassInput = styled.input`
  width: 3.2rem;
  height: 1.6rem;
  padding: 0 0.4rem;
  border: 1px solid #b9b9b9;
  border-radius: 0.375rem;
  font-family: "Inter";
  font-size: 0.75rem;
`;

export const ClassListScroll = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const ResetButton = styled.button`
  width: 100%;
  height: 2rem;
  margin-bottom: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: rgb(194, 44, 18);
  color: #fff;
  font-family: "Inter";
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    background: #004260;
  }
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalBox = styled.div`
  width: 22rem;
  padding: 2rem;
  border-radius: 0.75rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ModalRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    width: 4rem;
    font-family: "Inter";
    font-size: 0.9rem;
    font-weight: 600;
  }
`;

export const ModalNumberInput = styled.input`
  flex: 1;
  height: 1.8rem;
  padding: 0 0.5rem;
  border: 1px solid #b9b9b9;
  border-radius: 0.375rem;
  font-family: "Inter";
  font-size: 0.8rem;
`;

export const ModalActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export const ModalBtn = styled.button`
  width: 4.5rem;
  height: 1.9rem;
  border: none;
  border-radius: 0.375rem;
  background: #146c94;
  color: #fff;
  font-family: "Inter";
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    background: #004260;
  }
`;
