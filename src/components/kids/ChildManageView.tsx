"use client";

import React, { useState } from "react";
import { ChildProfileItem } from "@/lib/kidsTypes";
import {
  addChildInDb,
  updateChildInDb,
  deleteChildInDb,
} from "@/lib/kidsStorage";
import {
  Users,
  PlusCircle,
  Pencil,
  Trash2,
  Check,
  X,
  GraduationCap,
} from "lucide-react";

interface ChildManageViewProps {
  familyKey: string;
  childrenList: ChildProfileItem[];
  onRefresh: () => void;
  onChildAdded?: (item: ChildProfileItem) => void;
  onChildUpdated?: (item: ChildProfileItem, oldName: string) => void;
  onChildDeleted?: (id: number) => void;
}

const AVATAR_OPTIONS = ["👦", "👧", "🧒", "👶", "🎒", "🌟"];
const COLOR_OPTIONS = [
  "#3182F6",
  "#9f2cf5",
  "#00d000",
  "#F24553",
  "#d5ff00",
  "#FF9F43",
];

export default function ChildManageView({
  familyKey,
  childrenList,
  onRefresh,
  onChildAdded,
  onChildUpdated,
  onChildDeleted,
}: ChildManageViewProps) {
  const [name, setName] = useState("");
  const [gradeLabel, setGradeLabel] = useState("초등 1학년 (8세)");
  const [schoolName, setSchoolName] = useState("센텀초등학교");
  const [avatar, setAvatar] = useState("🧒");
  const [color, setColor] = useState("#00d000");
  const [birthYear, setBirthYear] = useState(2019);

  // 수정 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editOldName, setEditOldName] = useState("");
  const [editName, setEditName] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editSchool, setEditSchool] = useState("");
  const [editAvatar, setEditAvatar] = useState("👦");
  const [editColor, setEditColor] = useState("#3182F6");
  const [editBirthYear, setEditBirthYear] = useState(2017);

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addChildInDb({
      familyKey,
      name: name.trim(),
      gradeLabel,
      schoolName,
      avatar,
      color,
      birthYear,
    });
    setName("");
    onRefresh();
  };

  const startEdit = (c: ChildProfileItem) => {
    setEditingId(c.id);
    setEditOldName(c.name);
    setEditName(c.name);
    setEditGrade(c.gradeLabel);
    setEditSchool(c.schoolName);
    setEditAvatar(c.avatar);
    setEditColor(c.color);
    setEditBirthYear(c.birthYear);
  };

  const saveEdit = (id: number) => {
    updateChildInDb({
      id,
      familyKey,
      name: editName,
      gradeLabel: editGrade,
      schoolName: editSchool,
      avatar: editAvatar,
      color: editColor,
      birthYear: editBirthYear,
    });
    setEditingId(null);
    onRefresh();
  };

  const deleteChild = (id: number) => {
    deleteChildInDb(id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#d5ff00]" />
              남매 · 자녀 프로필 설정 관리 (총 {childrenList.length}명)
            </h2>
            <p className="text-xs text-zinc-400">
              자녀 이름·학년·학교·대표 색상을 수정하거나 셋째 등 자녀를 추가하면 학원 시간표, 간트 차트, 사교육비, 독서록 전체에 즉시 연동됩니다.
            </p>
          </div>
        </div>

        {/* 등록된 자녀 카드 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {childrenList.map((c) => {
            const isEditing = editingId === c.id;
            return (
              <div
                key={c.id}
                className="bg-[#202027] border-2 rounded-2xl p-5 transition"
                style={{ borderColor: isEditing ? "#d5ff00" : c.color }}
              >
                {!isEditing ? (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: `${c.color}25` }}
                      >
                        {c.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-white">
                            {c.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{
                              backgroundColor: `${c.color}30`,
                              color: c.color,
                            }}
                          >
                            {c.birthYear}년생
                          </span>
                        </div>
                        <div className="text-xs text-zinc-300 mt-1 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#d5ff00]" />
                          {c.gradeLabel} · {c.schoolName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(c)}
                        className="px-3 py-1.5 rounded-xl bg-[#17171C] hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center gap-1 border border-zinc-700"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#d5ff00]" />
                        수정
                      </button>
                      <button
                        onClick={() => deleteChild(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#F24553]/20 hover:bg-[#F24553]/40 text-[#F24553] text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="font-bold text-[#d5ff00]">
                      ✏️ 자녀 프로필 수정 중
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-zinc-400 mb-1">
                          자녀 표시명 (시간표 연동)
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#17171C] border border-zinc-700 rounded-lg px-2.5 py-2 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">
                          학년 / 나이 설명
                        </label>
                        <input
                          type="text"
                          value={editGrade}
                          onChange={(e) => setEditGrade(e.target.value)}
                          className="w-full bg-[#17171C] border border-zinc-700 rounded-lg px-2.5 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">
                          학교 / 유치원 / 어린이집명
                        </label>
                        <input
                          type="text"
                          value={editSchool}
                          onChange={(e) => setEditSchool(e.target.value)}
                          className="w-full bg-[#17171C] border border-zinc-700 rounded-lg px-2.5 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">
                          출생연도 / 아바타 / 색상
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            value={editBirthYear}
                            onChange={(e) =>
                              setEditBirthYear(Number(e.target.value))
                            }
                            className="w-20 bg-[#17171C] border border-zinc-700 rounded-lg px-2 py-2 text-white"
                          />
                          <select
                            aria-label="아바타 선택"
                            value={editAvatar}
                            onChange={(e) => setEditAvatar(e.target.value)}
                            className="bg-[#17171C] border border-zinc-700 rounded-lg px-2 py-2 text-white"
                          >
                            {AVATAR_OPTIONS.map((av) => (
                              <option key={av} value={av}>
                                {av}
                              </option>
                            ))}
                          </select>
                          <select
                            aria-label="색상 선택"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="bg-[#17171C] border border-zinc-700 rounded-lg px-2 py-2 text-white"
                          >
                            {COLOR_OPTIONS.map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> 취소
                      </button>
                      <button
                        onClick={() => saveEdit(c.id)}
                        className="px-4 py-1.5 rounded-lg bg-[#00d000] text-black font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> 저장 완료
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 신규 자녀(남매/형제/자매) 추가 폼 */}
        <form
          onSubmit={handleAddChild}
          className="bg-[#202027] border border-[#2E2E3A] rounded-2xl p-4"
        >
          <div className="text-xs font-bold text-[#d5ff00] mb-3 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" />+ 새로운 자녀(남매·형제·자매) 프로필 등록
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs items-end">
            <div>
              <label className="block text-zinc-400 mb-1">
                자녀 이름 (예: 셋째 김도윤 (5세))
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="셋째 김도윤 (5세)"
                className="w-full bg-[#17171C] border border-zinc-700 rounded-xl px-3 py-2 text-white font-semibold"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">학년 / 연령</label>
              <input
                type="text"
                value={gradeLabel}
                onChange={(e) => setGradeLabel(e.target.value)}
                placeholder="어린이집 새싹반 (5세)"
                className="w-full bg-[#17171C] border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">소속 학교/기관</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="해운대어린이집"
                className="w-full bg-[#17171C] border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">출생연도</label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="w-full bg-[#17171C] border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">아이콘 & 테마색</label>
              <div className="flex gap-1.5">
                <select
                  aria-label="신규 자녀 아이콘"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-1/2 bg-[#17171C] border border-zinc-700 rounded-xl px-2 py-2 text-white"
                >
                  {AVATAR_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="신규 자녀 테마색"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-1/2 bg-[#17171C] border border-zinc-700 rounded-xl px-2 py-2 text-white"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F24553] hover:bg-[#d93845] text-white font-bold"
              >
                자녀 추가
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
