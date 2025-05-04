import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 0.625rem;
  width: 78.125rem;
  height: 55rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  z-index: 1001;
`;

export const TitleArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem 2rem 1rem 2rem;

  h2 {
    color: #000;
    text-align: center;
    font-family: "Inter";
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }
`;

export const CloseButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
`;

export const Divider = styled.div`
  width: 78.25rem;
`;
export const Section = styled.div`
  padding: 0.5rem 2.5rem 0.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  label {
    color: #000;
    font-family: "Inter";
    font-size: 1rem;
    font-weight: 700;
  }
  p {
    color: red;
    margin: -0.25rem 0 0.5rem 0;
  }
`;

export const SectionTitle = styled.h3`
  color: #000;
  font-family: "Inter";
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

export const InfoRow = styled.div`
  color: #000;
  font-family: "Inter";
  font-size: 1rem;
  font-weight: 700;
`;

export const Line = styled.div`
  border-bottom: 0.0625rem solid black;
  margin-bottom: 1rem;
`;

export const InputArea = styled.div`
  width: 23rem;
  height: 2.5rem;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  border-radius: 0.625rem;
  border: solid 1px #424242;
  margin: 0.25rem 0 1rem 0;

  input {
    border: none;
    width: 23rem;
    margin: 0 0.5rem 0 1rem;
    background-color: transparent;
    font-size: 1rem;
  }

  input:focus {
    outline: none;
  }

  &::placeholder {
    color: #858585;
  }
`;

export const ToggleButton = styled.button.attrs({ type: "button" })`
  background: none;
  border: none;
  margin-right: 1rem;
  cursor: pointer;
  svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke: #424242;
  }
`;

export const Input = styled.input`
  width: 23rem;
  height: 2.5rem;
  border: 1px solid #ccc;
  border-radius: 0.625rem;

  color: black;
  font-family: "Noto Sans";
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  padding-left: 1rem;
  margin: 0.25rem 0 1rem 0;

  &::placeholder {
    color: #858585;
  }
`;

export const SchoolInput = styled.input`
  width: 23rem;
  height: 2.5rem;
  border: 1px solid #ccc;
  border-radius: 0.625rem;

  color: black;
  font-family: "Noto Sans";
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  padding-left: 1rem;
  margin: 0.25rem 0 1rem 0;
  &::placeholder {
    color: black;
  }
`;

export const SchoolList = styled.ul`
  position: absolute;
  width: 24rem;
  top: 35%;
  left: 3.25%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 20rem;
  overflow-y: auto;
  z-index: 10;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const SchoolItem = styled.li`
  margin-left: 1rem;
  font-size: 1.15rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

export const DropdownBox = styled.div`
  display: flex;
  flex-direction: row;
`;

export const DropDown = styled.select<{ id?: string }>`
  margin: 0.5rem 0 1rem 0rem;
  width: 7.25rem;
  height: 2.5rem;
  padding: 0.4rem;
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

  ${(props) => props.id === "semester" && `margin-left: 0.8rem;`}
`;

export const ChangeButton = styled.button`
  width: 7.25rem;
  height: 2.5rem;
  margin-bottom: 1rem;
  border-radius: 0.625rem;
  background: #146c94;
  color: #fff;
  text-align: center;
  font-family: "Inter";
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
`;
