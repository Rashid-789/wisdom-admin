import type {
  Subject,
  Course,
  CourseCurriculum,
  Lecture,
  Exercise,
} from "../Types/content.types";

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60 * 1000).toISOString();

export const SUBJECTS: Subject[] = [
  { id: "sub_math", title: "Applied Mathematics", gradeRange: "Grade 8-9", createdAt: iso(60 * 24 * 8) },
  { id: "sub_phy", title: "Physics", gradeRange: "Grade 8-9", createdAt: iso(60 * 24 * 6) },
  { id: "sub_cs", title: "Computer Science", gradeRange: "Grade 9-10", createdAt: iso(60 * 24 * 4) },
  { id: "sub_eng", title: "English Literature", gradeRange: "Grade 8-10", createdAt: iso(60 * 24 * 2) },
];

export const COURSES: Course[] = [
  {
    id: "c_math_intro",
    subjectId: "sub_math",
    category: "basic",
    title: "Algebra Foundations",
    description: "Linear equations, inequalities, and graphing fundamentals.",
    status: "published",
    createdAt: iso(60 * 24 * 5),
  },
  {
    id: "c_math_calc",
    subjectId: "sub_math",
    category: "skill",
    title: "Introduction to Calculus",
    description: "Limits, derivatives, and applications.",
    status: "scheduled",
    scheduledFor: iso(-60 * 24 * 7),
    createdAt: iso(60 * 24 * 3),
  },
  {
    id: "c_phy_motion",
    subjectId: "sub_phy",
    category: "basic",
    title: "Motion & Forces",
    description: "Kinematics, dynamics, and energy principles.",
    status: "draft",
    createdAt: iso(60 * 24 * 1),
  },
];

export const CURRICULUM: CourseCurriculum[] = [
  {
    courseId: "c_math_intro",
    chapters: [
      {
        id: "ch1",
        title: "Linear Equations",
        order: 1,
        topics: [
          { id: "t1", title: "Solving Basics", order: 1, lectureId: "l_math_lin1", exerciseId: "e_math_lin1" },
          { id: "t2", title: "Graphing Lines", order: 2, lectureId: "l_math_lin2", exerciseId: "e_math_lin2" },
        ],
      },
      {
        id: "ch2",
        title: "Inequalities",
        order: 2,
        topics: [
          { id: "t3", title: "One-Variable Inequalities", order: 1, lectureId: "l_math_ineq1" },
        ],
      },
    ],
  },
  {
    courseId: "c_math_calc",
    chapters: [
      {
        id: "ch3",
        title: "Limits",
        order: 1,
        topics: [
          { id: "t4", title: "Limit Basics", order: 1, lectureId: "l_math_lim1" },
          { id: "t5", title: "Continuity", order: 2, lectureId: "l_math_lim2" },
        ],
      },
    ],
  },
];

export const LECTURES: Lecture[] = [
  {
    id: "l_math_lin1",
    title: "Solving Linear Equations",
    courseId: "c_math_intro",
    durationSec: 900,
    videoUrl: "https://example.com/video/lin1",
    transcript: "Welcome to linear equations...",
    speedPoints: [
      { id: "sp1", timeSec: 60, label: "Isolate variable" },
      { id: "sp2", timeSec: 420, label: "Check solutions" },
    ],
    createdAt: iso(60 * 3),
  },
  {
    id: "l_math_lin2",
    title: "Graphing Lines",
    courseId: "c_math_intro",
    durationSec: 840,
    videoUrl: "https://example.com/video/lin2",
    transcript: "Slope-intercept form...",
    speedPoints: [{ id: "sp3", timeSec: 120, label: "Slope examples" }],
    createdAt: iso(60 * 2),
  },
  {
    id: "l_math_ineq1",
    title: "One-Variable Inequalities",
    courseId: "c_math_intro",
    durationSec: 780,
    videoUrl: "https://example.com/video/ineq1",
    transcript: "Inequalities basics...",
    speedPoints: [],
    createdAt: iso(60),
  },
  {
    id: "l_math_lim1",
    title: "Limit Basics",
    courseId: "c_math_calc",
    durationSec: 960,
    videoUrl: "https://example.com/video/limit1",
    transcript: "Approaching limits...",
    speedPoints: [],
    createdAt: iso(30),
  },
  {
    id: "l_math_lim2",
    title: "Continuity",
    courseId: "c_math_calc",
    durationSec: 840,
    videoUrl: "https://example.com/video/limit2",
    transcript: "Continuity discussion...",
    speedPoints: [],
    createdAt: iso(10),
  },
];

export const EXERCISES: Exercise[] = [
  {
    id: "e_math_lin1",
    title: "Solve Linear Equations",
    kind: "mcq",
    questions: [
      { type: "mcq", prompt: "Solve 2x + 4 = 12", options: ["x=3", "x=4", "x=5"], correctIndex: 0 },
      { type: "mcq", prompt: "Solve 3x - 6 = 9", options: ["x=3", "x=4", "x=5"], correctIndex: 2 },
    ],
    createdAt: iso(120),
  },
  {
    id: "e_math_lin2",
    title: "Graphing Practice",
    kind: "short",
    questions: [
      { type: "short", prompt: "What is the slope in y = 2x + 3?", sampleAnswer: "2" },
      { type: "short", prompt: "What is the y-intercept?", sampleAnswer: "3" },
    ],
    createdAt: iso(100),
  },
  {
    id: "e_math_free",
    title: "Continuity Scenarios",
    kind: "long",
    questions: [{ type: "long", prompt: "Explain continuity at a point", rubric: "Define limit and equality" }],
    createdAt: iso(80),
  },
];
