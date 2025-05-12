import styled from 'styled-components';

export const Page = styled.div`
  padding: 2rem 3rem;
  display: flex;
  gap: 2rem;
  background: #fff;
`;

/* 왼쪽·오른쪽 컬럼 */
export const Column = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #b9b9b9;

  &:last-child {
    border-right: none;
  }

  h2 {
    margin: 0 0 1.5rem 0;
    font-family: 'Inter';
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

/* 폼 공통 스타일 */
export const Form = styled.form`
 margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 16rem;
`;

export const Label = styled.label`
  font-family: 'Inter';
  font-size: 1.3rem;
  font-weight: 600; 
`;

export const Input = styled.input`
  height: 2.45rem;
  padding: 0 0.75rem;
  border: 1px solid #b9b9b9;
  border-radius: 0.375rem;
  font-family: 'Inter';
  font-size: 1.175rem;
`;

export const Select = styled.select`
  height: 2.25rem;
  padding: 0 0.75rem;
  border: 1px solid #b9b9b9;
  border-radius: 0.375rem;
  background: #fff;
  font-family: 'Inter';
  font-size: 0.875rem;
`;

export const SubmitButton = styled.button`
  margin-top: 1rem;
  width: 8rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  background: #365f86;
  color: #fff;
  font-family: 'Inter';
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    background: #274769;
  }
`;
