import styled from "styled-components";

export const MainContainer = styled.div`
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

export const Line = styled.div`
  width: 90rem;
  height: 0.0625rem;
  border-bottom: 0.0625rem solid black;
`;

export const ReportContainer = styled.div`
  margin-top: 3rem;
  width: 90rem;
  max-height: 37.4rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  overflow-y: scroll;
`;

export const GuideContainer = styled.div`
  width: 90rem;
  height: 37.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  font-family: "Noto Sans";
  font-size: 1.5rem;
  font-weight: 400;
`;
export const ControlContainer = styled.div`
  width: 90rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DropdownBox = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: row;
`;

export const DropDown = styled.select<{ id?: string }>`
  margin: 0 1rem 0 3rem;
  width: 7.25rem;
  height: 2.75rem;
  padding: 0.6rem;
  border-radius: 0.625rem;
  border: 0.0625rem solid #000;
  appearance: none;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 37 37" fill="none"><path d="M18.4991 23.0864C18.2935 23.0864 18.0941 23.0479 17.9009 22.9708C17.7077 22.8937 17.5474 22.791 17.4199 22.6625L10.3283 15.5708C10.0456 15.2882 9.9043 14.9285 9.9043 14.4916C9.9043 14.0548 10.0456 13.6951 10.3283 13.4125C10.6109 13.1298 10.9706 12.9885 11.4074 12.9885C11.8442 12.9885 12.204 13.1298 12.4866 13.4125L18.4991 19.425L24.5116 13.4125C24.7942 13.1298 25.154 12.9885 25.5908 12.9885C26.0276 12.9885 26.3873 13.1298 26.6699 13.4125C26.9526 13.6951 27.0939 14.0548 27.0939 14.4916C27.0939 14.9285 26.9526 15.2882 26.6699 15.5708L19.5783 22.6625C19.4241 22.8167 19.2571 22.9261 19.0772 22.9909C18.8974 23.0556 18.7046 23.0875 18.4991 23.0864Z" fill="%23666666"/></svg>')
    no-repeat left 0.625rem center;
  background-color: white;

  text-align: center;
  color: #424242;
  font-family: "Noto Sans";
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;

  &:option {
    color: #424242;
    font-family: "Noto Sans";
    font-size: 1rem;
    font-style: normal;
    font-weight: 600;
    margin-left: 1rem;
  }
  ${(props) => props.id === "grade" && `margin-left: 2rem;`}
  ${(props) => props.id === "semester" && `margin-left: 0.8rem;`}
  ${(props) => props.id === "type" && `width: 12rem; padding-left: 1rem;`}
`;

export const SearchBox = styled.div`
  width: 25rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  input {
    width: 21rem;
    height: 2.5rem;
    background: white;
    border: 1px solid black;
    border-radius: 0.625rem 0rem 0rem 0.625rem;
    overflow: auto;
    color: black;
    text-align: center;
    font-family: "Inter";
    font-weight: 700;
    font-size: 1rem;
    &::placeholder {
      color: #424242;
      font-weight: 400;
    }
  }
`;

export const SearchButton = styled.button`
  width: 3.25rem;
  height: 2.75rem;
  border-radius: 0rem 0.625rem 0.625rem 0rem;
  border: none;
  background: #004260;
  cursor: pointer;
  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

export const ButtonArea = styled.div`
  display: flex;
`;

export const ToggleWrapper = styled.div`
  display: flex;
  width: 12rem;
  height: 2.75rem;
  flex-shrink: 0;
  background: #e0e0e0;
  border-radius: 3.125rem;
  position: relative;
  margin-top: 1.5rem;
`;

export const ToggleButton = styled.div<{ $isExcel: boolean }>`
  width: 6rem;
  height: 2.5rem;
  background: white;
  border-radius: 3.125rem;
  top: 0.1rem;
  position: absolute;
  left: ${({ $isExcel }) => ($isExcel ? "0.1rem" : "5.9rem")};
  transition: left 0.3s ease-in-out;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
`;

export const OptionButton = styled.div<{ $isActive: boolean }>`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.75rem;
  font-weight: bold;
  color: ${({ $isActive }) => ($isActive ? "#000" : "#858585")};
  position: relative;
  z-index: 1;
  cursor: pointer;
  svg {
    margin-right: 0.25rem;
  }
`;

export const SaveButton = styled.button`
  margin: 1.5rem 0.5rem 0 0.5rem;
  height: 2.75rem;
  border: none;
  background: none;
  cursor: pointer;
`;

export const SelectedArea = styled.div`
  display: flex;
  flex-direction: row;
  align-items: end;
`;
