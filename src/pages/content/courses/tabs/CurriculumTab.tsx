// import React from "react";
// import toast from "react-hot-toast";
// import { Card, CardContent, Button, useDebouncedValue } from "../../../../app/shared";
// import type { Course, CourseCurriculum, Topic } from "../../Types/content.types";
// import { getBasicCurriculum, saveBasicCurriculum } from "../../Api/content.api";
// import CurriculumBuilder from "../components/CurriculumBuilder/CurriculumBuilder";
// import TopicDrawer from "../components/CurriculumBuilder/curriculum/TopicDrawer";
// import {
//   curriculumSignature,
//   getApiErrorMessage,
//   normalizeCourseCurriculum,
// } from "../../utils/curriculum.utils";

// function countTopics(chapters: CourseCurriculum["chapters"]): number {
//   return chapters.reduce((total, chapter) => total + chapter.topics.length, 0);
// }

// export default function CurriculumTab({ course }: { course: Course }) {
//   const [value, setValue] = React.useState<CourseCurriculum>({ courseId: course.id, chapters: [] });
//   const [loading, setLoading] = React.useState(true);
//   const [saving, setSaving] = React.useState(false);

//   const [topicOpen, setTopicOpen] = React.useState(false);
//   const [topicCtx, setTopicCtx] = React.useState<{ chapterId: string; topic: Topic } | null>(null);
//   const lastSavedSignatureRef = React.useRef("");
//   const lastSavedHadChaptersRef = React.useRef(false);
//   const dirtyRef = React.useRef(false);
//   const loadVersionRef = React.useRef(0);
//   const saveVersionRef = React.useRef(0);
//   const debouncedValue = useDebouncedValue(value, 800);

//   const load = React.useCallback(async () => {
//     const loadId = ++loadVersionRef.current;
//     setLoading(true);
//     console.debug("[curriculum-ui] load start", {
//       subjectId: course.subjectId,
//       courseId: course.id,
//       loadId,
//     });
//     try {
//       const fetched = await getBasicCurriculum(course.subjectId, course.id);
//       const fetchedSignature = curriculumSignature(fetched.chapters);
//       console.debug("[curriculum-ui] load success", {
//         subjectId: course.subjectId,
//         courseId: course.id,
//         loadId,
//         chaptersCount: fetched.chapters.length,
//         topicsCount: countTopics(fetched.chapters),
//       });

//       if (loadId !== loadVersionRef.current) {
//         console.debug("[curriculum-ui] load ignored (stale response)", {
//           subjectId: course.subjectId,
//           courseId: course.id,
//           loadId,
//         });
//         return;
//       }

//       if (dirtyRef.current) {
//         console.debug("[curriculum-ui] load ignored (local state is dirty)", {
//           subjectId: course.subjectId,
//           courseId: course.id,
//           loadId,
//         });
//         return;
//       }

//       setValue(() => {
//         console.debug("[curriculum-ui] setValue from load", {
//           subjectId: course.subjectId,
//           courseId: course.id,
//           loadId,
//           chaptersCount: fetched.chapters.length,
//           topicsCount: countTopics(fetched.chapters),
//         });
//         return fetched;
//       });
//       lastSavedSignatureRef.current = fetchedSignature;
//       lastSavedHadChaptersRef.current = fetched.chapters.length > 0;
//       dirtyRef.current = false;
//     } finally {
//       if (loadId === loadVersionRef.current) {
//         setLoading(false);
//       }
//     }
//   }, [course.id, course.subjectId]);

//   React.useEffect(() => { load(); }, [load]);

//   const applyCurriculumChange = React.useCallback(
//     (reason: string, updater: (prev: CourseCurriculum) => CourseCurriculum) => {
//       setValue((prev) => {
//         const next = updater(prev);
//         dirtyRef.current = true;
//         console.debug("[curriculum-ui] local change", {
//           subjectId: course.subjectId,
//           courseId: course.id,
//           reason,
//           chaptersCount: next.chapters.length,
//           topicsCount: countTopics(next.chapters),
//         });
//         return next;
//       });
//     },
//     [course.id, course.subjectId]
//   );

//   const saveCurriculum = React.useCallback(
//     async (
//       next: CourseCurriculum,
//       options?: { silent?: boolean; reason?: "manual" | "autosave"; allowEmpty?: boolean }
//     ) => {
//       const normalized = normalizeCourseCurriculum(next);
//       const signature = curriculumSignature(normalized.chapters);
//       if (signature === lastSavedSignatureRef.current) return;

//       if (
//         options?.reason === "autosave" &&
//         !options.allowEmpty &&
//         normalized.chapters.length === 0 &&
//         dirtyRef.current &&
//         lastSavedHadChaptersRef.current
//       ) {
//         console.debug("[curriculum-ui] autosave skipped to prevent accidental empty overwrite", {
//           subjectId: course.subjectId,
//           courseId: course.id,
//         });
//         return;
//       }

//       const saveId = ++saveVersionRef.current;
//       setSaving(true);
//       console.debug("[curriculum-ui] save start", {
//         subjectId: course.subjectId,
//         courseId: course.id,
//         saveId,
//         reason: options?.reason ?? "manual",
//         chaptersCount: normalized.chapters.length,
//         topicsCount: countTopics(normalized.chapters),
//       });
//       try {
//         const saved = await saveBasicCurriculum(course.subjectId, course.id, normalized);
//         const savedSignature = curriculumSignature(saved.chapters);
//         const isOutdatedResponse = saveId !== saveVersionRef.current;

//         setValue((prev) => {
//           const currentSignature = curriculumSignature(prev.chapters);

//           if (isOutdatedResponse) {
//             console.debug("[curriculum-ui] save response ignored (newer save exists)", {
//               subjectId: course.subjectId,
//               courseId: course.id,
//               saveId,
//             });
//             return prev;
//           }

//           if (currentSignature !== signature) {
//             console.debug("[curriculum-ui] save response ignored (local state changed since save start)", {
//               subjectId: course.subjectId,
//               courseId: course.id,
//               saveId,
//             });
//             if (currentSignature === savedSignature) {
//               lastSavedSignatureRef.current = savedSignature;
//               lastSavedHadChaptersRef.current = saved.chapters.length > 0;
//               dirtyRef.current = false;
//             }
//             return prev;
//           }

//           console.debug("[curriculum-ui] setValue from save", {
//             subjectId: course.subjectId,
//             courseId: course.id,
//             saveId,
//             chaptersCount: saved.chapters.length,
//             topicsCount: countTopics(saved.chapters),
//           });
//           lastSavedSignatureRef.current = savedSignature;
//           lastSavedHadChaptersRef.current = saved.chapters.length > 0;
//           dirtyRef.current = false;
//           return saved;
//         });
//         if (!options?.silent) {
//           toast.success("Curriculum saved");
//         }
//       } catch (error) {
//         toast.error(getApiErrorMessage(error, "Failed to save curriculum"));
//       } finally {
//         if (saveId === saveVersionRef.current) {
//           setSaving(false);
//         }
//       }
//     },
//     [course.id, course.subjectId]
//   );

//   React.useEffect(() => {
//     if (loading) return;
//     const normalized = normalizeCourseCurriculum(debouncedValue);
//     const signature = curriculumSignature(normalized.chapters);
//     if (signature === lastSavedSignatureRef.current) return;
//     if (
//       normalized.chapters.length === 0 &&
//       dirtyRef.current &&
//       lastSavedHadChaptersRef.current
//     ) {
//       console.debug("[curriculum-ui] autosave skipped for empty curriculum", {
//         subjectId: course.subjectId,
//         courseId: course.id,
//       });
//       return;
//     }
//     void saveCurriculum(normalized, { silent: true, reason: "autosave" });
//   }, [course.id, course.subjectId, debouncedValue, loading, saveCurriculum]);

//   const updateTopic = (chapterId: string, updated: Topic) => {
//     applyCurriculumChange("topic-updated", (prev) => ({
//       ...prev,
//       chapters: prev.chapters.map((ch) =>
//         ch.id !== chapterId
//           ? ch
//           : { ...ch, topics: ch.topics.map((t) => (t.id === updated.id ? updated : t)) }
//       ),
//     }));
//   };

//   return (
//     <>
//       <Card>
//         <CardContent className="p-4 sm:p-6 space-y-4">
//           <div className="flex flex-wrap items-center justify-between gap-2">
//             <div>
//               <p className="text-sm font-semibold text-slate-900">Curriculum</p>
//               <p className="text-sm text-slate-500">
//                 Build chapters ? topics. Each topic holds the lecture video (+ tokens) and optional exercise.
//               </p>
//             </div>

//             <Button
//               isLoading={saving}
//               disabled={loading}
//               onClick={() =>
//                 void saveCurriculum(value, {
//                   reason: "manual",
//                   allowEmpty: true,
//                 })
//               }
//             >
//               Save Curriculum
//             </Button>
//           </div>

//           <CurriculumBuilder
//             value={value}
//             isLoading={loading}
//             onChange={(next) => {
//               applyCurriculumChange("builder-change", () => next);
//             }}
//             onEditTopic={(chapterId, topic) => {
//               setTopicCtx({ chapterId, topic });
//               setTopicOpen(true);
//             }}
//           />
//         </CardContent>
//       </Card>

//       <TopicDrawer
//         open={topicOpen}
//         onClose={() => setTopicOpen(false)}
//         subjectId={course.subjectId}
//         courseId={course.id}
//         chapterId={topicCtx?.chapterId ?? ""}
//         topic={topicCtx?.topic ?? null}
//         onChangeTopic={(updated) => {
//           if (!topicCtx) return;
//           updateTopic(topicCtx.chapterId, updated);
//           setTopicCtx((p) => (p ? { ...p, topic: updated } : p));
//         }}
//       />
//     </>
//   );
// }


import React from "react";
import toast from "react-hot-toast";
import { Card, CardContent, Button, useDebouncedValue } from "../../../../app/shared";
import type { Course, CourseCurriculum, Topic } from "../../Types/content.types";
import { getCurriculum as apiGetCurriculum, saveCurriculum as apiSaveCurriculum } from "../../Api/content.api";
import CurriculumBuilder from "../components/CurriculumBuilder/CurriculumBuilder";
import TopicDrawer from "../components/CurriculumBuilder/curriculum/TopicDrawer";
import {
  curriculumSignature,
  getApiErrorMessage,
  normalizeCourseCurriculum,
} from "../../utils/curriculum.utils";

function countTopics(chapters: CourseCurriculum["chapters"]): number {
  return chapters.reduce((total, chapter) => total + chapter.topics.length, 0);
}

export default function CurriculumTab({ course }: { course: Course }) {
  const [value, setValue] = React.useState<CourseCurriculum>({ courseId: course.id, chapters: [] });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [topicOpen, setTopicOpen] = React.useState(false);
  const [topicCtx, setTopicCtx] = React.useState<{ chapterId: string; topic: Topic } | null>(null);

  const lastSavedSignatureRef = React.useRef("");
  const lastSavedHadChaptersRef = React.useRef(false);
  const dirtyRef = React.useRef(false);
  const loadVersionRef = React.useRef(0);
  const saveVersionRef = React.useRef(0);

  const debouncedValue = useDebouncedValue(value, 800);

  const load = React.useCallback(async () => {
    const loadId = ++loadVersionRef.current;
    setLoading(true);

    console.debug("[curriculum-ui] load start", { courseId: course.id, loadId, category: course.category });

    try {
      const fetched = await apiGetCurriculum(course.id);
      const fetchedSignature = curriculumSignature(fetched.chapters);

      console.debug("[curriculum-ui] load success", {
        courseId: course.id,
        loadId,
        chaptersCount: fetched.chapters.length,
        topicsCount: countTopics(fetched.chapters),
      });

      if (loadId !== loadVersionRef.current) return;
      if (dirtyRef.current) return;

      setValue(() => fetched);
      lastSavedSignatureRef.current = fetchedSignature;
      lastSavedHadChaptersRef.current = fetched.chapters.length > 0;
      dirtyRef.current = false;
    } finally {
      if (loadId === loadVersionRef.current) setLoading(false);
    }
  }, [course.id, course.category]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const applyCurriculumChange = React.useCallback(
    (reason: string, updater: (prev: CourseCurriculum) => CourseCurriculum) => {
      setValue((prev) => {
        const next = updater(prev);
        dirtyRef.current = true;
        console.debug("[curriculum-ui] local change", {
          courseId: course.id,
          reason,
          chaptersCount: next.chapters.length,
          topicsCount: countTopics(next.chapters),
        });
        return next;
      });
    },
    [course.id]
  );

  const saveCurriculumToDb = React.useCallback(
    async (
      next: CourseCurriculum,
      options?: { silent?: boolean; reason?: "manual" | "autosave"; allowEmpty?: boolean }
    ) => {
      const normalized = normalizeCourseCurriculum(next);
      const signature = curriculumSignature(normalized.chapters);
      if (signature === lastSavedSignatureRef.current) return;

      if (
        options?.reason === "autosave" &&
        !options.allowEmpty &&
        normalized.chapters.length === 0 &&
        dirtyRef.current &&
        lastSavedHadChaptersRef.current
      ) {
        console.debug("[curriculum-ui] autosave skipped to prevent accidental empty overwrite", {
          courseId: course.id,
        });
        return;
      }

      const saveId = ++saveVersionRef.current;
      setSaving(true);

      console.debug("[curriculum-ui] save start", {
        courseId: course.id,
        saveId,
        reason: options?.reason ?? "manual",
        chaptersCount: normalized.chapters.length,
        topicsCount: countTopics(normalized.chapters),
      });

      try {
        const saved = await apiSaveCurriculum(course.id, normalized);
        const savedSignature = curriculumSignature(saved.chapters);
        const isOutdatedResponse = saveId !== saveVersionRef.current;

        setValue((prev) => {
          const currentSignature = curriculumSignature(prev.chapters);

          if (isOutdatedResponse) return prev;

          if (currentSignature !== signature) {
            if (currentSignature === savedSignature) {
              lastSavedSignatureRef.current = savedSignature;
              lastSavedHadChaptersRef.current = saved.chapters.length > 0;
              dirtyRef.current = false;
            }
            return prev;
          }

          lastSavedSignatureRef.current = savedSignature;
          lastSavedHadChaptersRef.current = saved.chapters.length > 0;
          dirtyRef.current = false;
          return saved;
        });

        if (!options?.silent) toast.success("Curriculum saved");
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to save curriculum"));
      } finally {
        if (saveId === saveVersionRef.current) setSaving(false);
      }
    },
    [course.id]
  );

  React.useEffect(() => {
    if (loading) return;
    const normalized = normalizeCourseCurriculum(debouncedValue);
    const signature = curriculumSignature(normalized.chapters);
    if (signature === lastSavedSignatureRef.current) return;

    if (normalized.chapters.length === 0 && dirtyRef.current && lastSavedHadChaptersRef.current) {
      console.debug("[curriculum-ui] autosave skipped for empty curriculum", { courseId: course.id });
      return;
    }

    void saveCurriculumToDb(normalized, { silent: true, reason: "autosave" });
  }, [debouncedValue, loading, saveCurriculumToDb, course.id]);

  const updateTopic = (chapterId: string, updated: Topic) => {
    applyCurriculumChange("topic-updated", (prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id !== chapterId ? ch : { ...ch, topics: ch.topics.map((t) => (t.id === updated.id ? updated : t)) }
      ),
    }));
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Curriculum</p>
              <p className="text-sm text-slate-500">
                Build chapters & topics. Each topic contains video, tokens, transcript, and speed points.
              </p>
            </div>

            <Button
              isLoading={saving}
              disabled={loading}
              onClick={() => void saveCurriculumToDb(value, { reason: "manual", allowEmpty: true })}
            >
              Save Curriculum
            </Button>
          </div>

          <CurriculumBuilder
            value={value}
            isLoading={loading}
            onChange={(next) => applyCurriculumChange("builder-change", () => next)}
            onEditTopic={(chapterId, topic) => {
              setTopicCtx({ chapterId, topic });
              setTopicOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <TopicDrawer
        open={topicOpen}
        onClose={() => setTopicOpen(false)}
        courseId={course.id}
        courseCategory={course.category}
        chapterId={topicCtx?.chapterId ?? ""}
        topic={topicCtx?.topic ?? null}
        onChangeTopic={(updated) => {
          if (!topicCtx) return;
          updateTopic(topicCtx.chapterId, updated);
          setTopicCtx((p) => (p ? { ...p, topic: updated } : p));
        }}
      />
    </>
  );
}
