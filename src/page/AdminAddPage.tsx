import React, { useState } from "react";
import axios from "axios"; 
import {
  Page,
  Column,
  Form,
  Label,
  Input,
  Select,
  SubmitButton,
} from "./AdminAddPage.styled";

const AdminAddPage: React.FC = () => {
  const [stuForm, setStuForm] = useState({
    name: "",
    email: "",
    grade: 1,
    phonenumber: "",
    homenumber: "",
    address: "",
  });

  const [tchForm, setTchForm] = useState({
    name: "",
    email: "",
    subject: "과학",
  });

  const handleStuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setStuForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleTchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setTchForm({ ...tchForm, [e.target.name]: e.target.value });

  const submitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await axios.post(
        "api/v1/auth/sign-up",
        {
          ...stuForm,
          role: "STUDENT",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("학생 계정이 생성되었습니다!");
      console.log(response.data);
      setStuForm({
        name: "",
        email: "",
        grade: 1,
        phonenumber: "",
        homenumber: "",
        address: "",
      });
    } catch (error) {
      console.error("학생 계정 생성 실패:", error);
      alert("학생 계정 생성에 실패했습니다.");
    }
  };

  const submitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("accessToken");
      console.log(tchForm);
      const response = await axios.post(
        "api/v1/auth/sign-up",
        {
          ...tchForm,
          role: "TEACHER",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("교사 계정이 생성되었습니다!");
      console.log(response.data);
      setTchForm({ name: "", email: "", subject: "과학" });
    } catch (error) {
      console.error("교사 계정 생성 실패:", error);
      alert("교사 계정 생성에 실패했습니다.");
    }
  };

  return (
    <Page>
      {/* 학생 폼 */}
      <Column>
        <h2>학생</h2>
        <Form onSubmit={submitStudent}>
          <Label>이름</Label>
          <Input
            name="name"
            value={stuForm.name}
            onChange={handleStuChange}
            required
          />
          <Label>이메일</Label>
          <Input
            type="email"
            name="email"
            value={stuForm.email}
            onChange={handleStuChange}
            required
          />
          <Label>학년</Label>
          <Input
            name="grade"
            type="number"
            value={stuForm.grade}
            onChange={handleStuChange}
            required
          />
          <Label>전화번호</Label>
          <Input
            name="phonenumber"
            value={stuForm.phonenumber}
            onChange={handleStuChange}
            required
          />
          <Label>집주소</Label>
          <Input
            name="address"
            value={stuForm.address}
            onChange={handleStuChange}
            required
          />
          <Label>부모님 연락처</Label>
          <Input
            name="homenumber"
            value={stuForm.homenumber}
            onChange={handleStuChange}
            required
          />
          <SubmitButton type="submit">계정 생성</SubmitButton>
        </Form>
      </Column>

      {/* 교사 폼 */}
      <Column>
        <h2>담임</h2>
        <Form onSubmit={submitTeacher}>
          <Label>이름</Label>
          <Input
            name="name"
            value={tchForm.name}
            onChange={handleTchChange}
            required
          />
          <Label>이메일</Label>
          <Input
            type="email"
            name="email"
            value={tchForm.email}
            onChange={handleTchChange}
            required
          />
          <Label>담당과목</Label>
          <Select
            name="subject"
            value={tchForm.subject}
            onChange={handleTchChange}
          >
            <option>국어</option>
            <option>수학</option>
            <option>영어</option>
            <option>과학</option>
            <option>사회</option>
          </Select>
          <SubmitButton type="submit">계정 생성</SubmitButton>
        </Form>
      </Column>
    </Page>
  );
};

export default AdminAddPage;
