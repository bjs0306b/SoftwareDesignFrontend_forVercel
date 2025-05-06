import React from "react";
import { useAuthStore } from "../stores/authStore";
import { styled } from "styled-components";

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h1 {
    align-self: flex-start;
    color: #000;
    font-family: "Noto Sans";
    font-size: 2.25rem;
    font-style: normal;
    font-weight: bold;
    display: flex;
    margin: 1rem 0 1rem 3rem;
  }
`;
const GuideMessage = styled.div`
  height: 42.75rem;
  display: flex;

  justify-content: center;
  color: #000;
  font-family: "Noto Sans";
  font-size: 1.5rem;
  font-weight: 400;
  margin-top: 20.3rem;
`;

export const Line = styled.div`
  width: 90rem;
  height: 0.0625rem;
  border-bottom: 0.0625rem solid black;
`;

const MainPage: React.FC = () => {
  const userName = useAuthStore((state) => state.userName);
  const role = useAuthStore((state) => state.role);

  return (
    <MainContainer>
      <h1>LearnBridge</h1>
      <Line />
      <GuideMessage>
        {userName} {role === "TEACHER" ? "선생님" : "학생"}, 환영합니다.
      </GuideMessage>
    </MainContainer>
  );
};

export default MainPage;
