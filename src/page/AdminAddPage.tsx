import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  Page,
  Column,
  Form,
  Label,
  Input,
  Select,
  SubmitButton,
} from './AdminAddPage.styled';

const AdminAddPage: React.FC = () => {
  /* ───── 학생 폼 상태 ───── */
  const [stuForm, setStuForm] = useState({
    name: '',
    grade: '',
    phone: '',
    address: '',
    parentPhone: '',
  });

  /* ───── 교사 폼 상태 ───── */
  const [tchForm, setTchForm] = useState({
    name: '',
    subject: '국어',
  });

  /* ───── 입력 핸들러 ───── */
  const handleStuChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setStuForm({ ...stuForm, [e.target.name]: e.target.value });
  const handleTchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setTchForm({ ...tchForm, [e.target.name]: e.target.value });

  /* ───── 제출 ───── */
  const submitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 API 경로에 맞게 수정
    await axiosInstance.post('/account/student', {
      ...stuForm,
      role: 'STUDENT',
    });
    alert('학생 계정이 생성되었습니다!');
    setStuForm({ name: '', grade: '', phone: '', address: '', parentPhone: '' });
  };

  const submitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    await axiosInstance.post('/account/teacher', {
      ...tchForm,
      role: 'TEACHER',
    });
    alert('교사 계정이 생성되었습니다!');
    setTchForm({ name: '', subject: '국어' });
  };

  return (
    <Page>
      {/* ───────── 학생 ───────── */}
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

          <Label>학년</Label>
          <Input
            name="grade"
            value={stuForm.grade}
            onChange={handleStuChange}
            required
          />

          <Label>전화번호</Label>
          <Input
            name="phone"
            value={stuForm.phone}
            onChange={handleStuChange}
          />

          <Label>집주소</Label>
          <Input
            name="address"
            value={stuForm.address}
            onChange={handleStuChange}
          />

          <Label>부모님 연락처</Label>
          <Input
            name="parentPhone"
            value={stuForm.parentPhone}
            onChange={handleStuChange}
          />

          <SubmitButton type="submit">계정 생성</SubmitButton>
        </Form>
      </Column>

      {/* ───────── 교사 ───────── */}
      <Column>
        {/* 오른쪽은 구분선이 없으므로 border‑right 없음 */}
        <h2>담임</h2>
        <Form onSubmit={submitTeacher}>
          
          <Label>이름</Label>
          <Input
            name="name"
            value={tchForm.name}
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
