"use client";

import { useState } from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";

interface CourseRow {
  id: string;
  name: string;
  grade: string;
  credits: number;
  isHonors: boolean;
}

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "F": 0.0,
};

export function GpaCalculator() {
  const [courses, setCourses] = useState<CourseRow[]>([
    { id: "1", name: "Computer Science 101", grade: "A", credits: 4, isHonors: true },
    { id: "2", name: "Calculus II", grade: "A-", credits: 4, isHonors: false },
    { id: "3", name: "Physics Mechanics", grade: "B+", credits: 3, isHonors: false },
    { id: "4", name: "Academic Writing", grade: "A", credits: 3, isHonors: false },
  ]);

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: Date.now().toString(), name: "New Course", grade: "A", credits: 3, isHonors: false },
    ]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof CourseRow, val: any) => {
    setCourses(
      courses.map((c) => {
        if (c.id === id) {
          return { ...c, [field]: val };
        }
        return c;
      })
    );
  };

  // GPA Calcs
  const calculateGpa = () => {
    let totalCredits = 0;
    let totalUnweightedPoints = 0;
    let totalWeightedPoints = 0;

    courses.forEach((c) => {
      const basePoints = GRADE_POINTS[c.grade] ?? 4.0;
      const weightBonus = c.isHonors ? 0.5 : 0.0;
      totalCredits += c.credits;
      totalUnweightedPoints += basePoints * c.credits;
      totalWeightedPoints += (basePoints + weightBonus) * c.credits;
    });

    const unweightedGpa = totalCredits > 0 ? (totalUnweightedPoints / totalCredits).toFixed(2) : "0.00";
    const weightedGpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";

    return {
      unweightedGpa,
      weightedGpa,
      totalCredits,
    };
  };

  const { unweightedGpa, weightedGpa, totalCredits } = calculateGpa();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Unweighted GPA (4.0 Scale)
          </span>
          <p className="text-4xl font-black font-mono text-blue-600 dark:text-blue-400">
            {unweightedGpa}
          </p>
          <span className="text-xs text-muted-foreground">Standard non-weighted point average</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Weighted GPA (+0.5 Honors)
          </span>
          <p className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {weightedGpa}
          </p>
          <span className="text-xs text-muted-foreground">Including Honors / AP course weighting</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Credits Earned
          </span>
          <p className="text-4xl font-black font-mono text-foreground">
            {totalCredits}
          </p>
          <span className="text-xs text-muted-foreground">Across {courses.length} courses</span>
        </div>
      </div>

      {/* Courses Table */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Semester Courses
          </span>
          <button
            type="button"
            onClick={addCourse}
            className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Course Name</th>
                <th className="py-2.5 px-3 w-28">Letter Grade</th>
                <th className="py-2.5 px-3 w-24">Credits</th>
                <th className="py-2.5 px-3 w-28 text-center">Honors / AP</th>
                <th className="py-2.5 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCourse(c.id, "name", e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={c.grade}
                      onChange={(e) => updateCourse(c.id, "grade", e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none font-bold"
                    >
                      {Object.keys(GRADE_POINTS).map((g) => (
                        <option key={g} value={g}>
                          {g} ({GRADE_POINTS[g].toFixed(1)})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={c.credits}
                      onChange={(e) => updateCourse(c.id, "credits", parseInt(e.target.value) || 1)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={c.isHonors}
                      onChange={(e) => updateCourse(c.id, "isHonors", e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeCourse(c.id)}
                      className="text-muted-foreground hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
