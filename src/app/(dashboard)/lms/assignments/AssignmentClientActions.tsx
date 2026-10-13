"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Role } from "@prisma/client";
import { CheckCircle2, FileText, Upload } from "lucide-react";
import React, { useState } from "react";

interface Props {
  assignment: any;
  mySubmission?: any;
  userRole: Role;
}

export function AssignmentClientActions({
  assignment,
  mySubmission,
  userRole,
}: Props) {
  // Student Submit State
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Faculty Grading State
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [marks, setMarks] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isGrading, setIsGrading] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState(false);

  // Student upload handler
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("assignmentId", assignment.id);
    formData.append("notes", submissionNotes);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const res = await fetch("/api/lms/submissions", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsSubmitOpen(false);
          window.location.reload();
        }, 1200);
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  // Faculty grading handler
  const handleSaveGrade = async (submissionId: string) => {
    setIsGrading(true);
    try {
      const res = await fetch("/api/lms/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          marks,
          feedback,
        }),
      });

      if (res.ok) {
        setGradeSuccess(true);
        setTimeout(() => {
          setIsGradeOpen(false);
          window.location.reload();
        }, 1000);
      }
    } catch {
      // Fallback
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Student Action Button */}
      {userRole === "STUDENT" && (
        <>
          {mySubmission ? (
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1.5 py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {mySubmission.status === "GRADED" ? "Graded" : "Submitted"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitOpen(true)}
              >
                Resubmit
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSubmitOpen(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Submission
            </Button>
          )}

          {/* Student Upload Modal */}
          <Modal
            isOpen={isSubmitOpen}
            onClose={() => setIsSubmitOpen(false)}
            title={`Submit: ${assignment.title}`}
            description="Upload your source code archive (.zip) or written report (.pdf)."
          >
            {submitSuccess ? (
              <div className="p-6 text-center text-emerald-500 font-bold space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <p>Assignment submitted successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Select File (.zip, .pdf, .docx)
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Submission Notes & Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Provide execution instructions or test run details for faculty review..."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsSubmitOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSubmitting}>
                    Confirm & Submit
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        </>
      )}

      {/* Faculty Grading Action Button */}
      {(userRole === "FACULTY" || userRole === "ADMIN") && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGradeOpen(true)}
            className="gap-2 text-xs"
          >
            <FileText className="w-4 h-4 text-purple-500" />
            Review & Grade ({assignment.submissions.length} Submissions)
          </Button>

          {/* Faculty Review Modal */}
          <Modal
            isOpen={isGradeOpen}
            onClose={() => setIsGradeOpen(false)}
            title={`Grade: ${assignment.title}`}
            description={`Max Points: ${assignment.maxMarks} marks`}
            className="max-w-2xl"
          >
            {assignment.submissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No students have submitted this assignment yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {assignment.submissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {sub.student.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge
                        variant={sub.status === "GRADED" ? "success" : "warning"}
                      >
                        {sub.status === "GRADED"
                          ? `${sub.marks} / ${assignment.maxMarks} pts`
                          : "Pending Grade"}
                      </Badge>
                    </div>

                    {sub.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{sub.notes}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="number"
                        placeholder={`Marks (Max ${assignment.maxMarks})`}
                        defaultValue={sub.marks || ""}
                        onChange={(e) => {
                          setSelectedSubmission(sub.id);
                          setMarks(e.target.value);
                        }}
                        className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        placeholder="Constructive feedback note..."
                        defaultValue={sub.feedback || ""}
                        onChange={(e) => {
                          setSelectedSubmission(sub.id);
                          setFeedback(e.target.value);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={isGrading && selectedSubmission === sub.id}
                        onClick={() => handleSaveGrade(sub.id)}
                        className="text-xs py-1"
                      >
                        Save Grade
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
